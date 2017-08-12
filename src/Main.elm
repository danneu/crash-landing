module Main exposing (..)

import Ability exposing (Ability)
import Action exposing (Action)
import AnimationFrame
import EverySet exposing (EverySet)
import Html as Html exposing (Html, div, program, text)
import Html.Attributes as Hattrs
import Html.Events as Hevents
import Inventory exposing (Inventory)
import Item exposing (Item)
import Port
import Price
import Quantity exposing (Quantity)
import Round
import Spectre
import Time exposing (Time)


-- MODEL


type ActionTab
    = Fabrication
    | Research


type alias Survivor =
    { suspended : Bool
    , dead : Bool
    , action : Action
    }


type PowerTarget
    = LifeSupport
    | MatterCollector


type alias Model =
    { survivor : Survivor
    , power : Quantity
    , powerTarget : PowerTarget
    , oxygen : Quantity
    , matter : Quantity
    , charging : Bool
    , paused : Bool
    , inventory : Inventory
    , abilities : EverySet Ability

    -- UI
    , actionTab : ActionTab
    , showHelp : Bool
    }


initPodState : Model
initPodState =
    { survivor = { suspended = True, action = Action.Idling, dead = False }
    , power = Quantity 30 100
    , powerTarget = LifeSupport
    , oxygen = Quantity 50 100
    , matter = Quantity 20 100
    , charging = False
    , paused = False
    , inventory = Inventory.empty
    , abilities = EverySet.empty

    -- UI
    , actionTab = Fabrication
    , showHelp = True
    }


init : ( Model, Cmd Msg )
init =
    ( initPodState
    , Cmd.none
    )



-- MESSAGES


type Msg
    = NoOp
    | Tick Time
    | SetCharging Bool
    | SetPowerTarget PowerTarget
    | SetSurvivorSuspension Bool
    | SetSurvivorAction Action
    | SetPaused Bool
    | SetActionTab ActionTab
    | BeginFabricating Item
    | DismissHelp



-- TODO: Finish migrating to `{resource}GrowthPerSecond` and `net{Resource}PerSecond` functions


oxygenPerSecond : Model -> Float
oxygenPerSecond model =
    let
        consumed1 =
            if model.survivor.suspended then
                0.1
            else
                1.5

        consumed2 =
            if not model.survivor.suspended && EverySet.member Ability.ShallowBreathing model.abilities then
                consumed1 - 0.75
            else
                consumed1

        produced =
            case model.powerTarget of
                LifeSupport ->
                    -- Life support needs power to work
                    if model.power.curr == 0 then
                        0
                    else
                        1

                _ ->
                    0
    in
    produced - consumed2


{-| Fabricator matter consumption per second

Efficiency * AvailableMatter = How much of the consumed matter contributes to the build

-}
getFabricatorEfficiency : Model -> Float
getFabricatorEfficiency model =
    List.sum
        [ -- base
          0.5
        , -- engineering bonus
          if EverySet.member Ability.Engineering model.abilities then
            0.25
          else
            0
        ]


{-| Returns per-second values
-}
getFabricatorConsumption : Model -> { matter : Float, power : Float }
getFabricatorConsumption model =
    if model.survivor.suspended then
        -- Survivor cannot operate the fab while suspended
        { matter = 0, power = 0 }
    else
        case model.survivor.action of
            Action.Fabricating _ _ ->
                { matter = 2, power = 1 }

            _ ->
                { matter = 0, power = 0 }


matterGrowthPerSecond : Model -> Float
matterGrowthPerSecond model =
    case model.powerTarget of
        MatterCollector ->
            -- Collector doesn't work without power
            if model.power.curr == 0 then
                0
            else
                1

        _ ->
            0


netMatterPerSecond : Model -> Float
netMatterPerSecond model =
    let
        consumed =
            .matter <| getFabricatorConsumption model

        produced =
            matterGrowthPerSecond model
    in
    produced - consumed


powerGrowthPerSecond : Model -> Float
powerGrowthPerSecond model =
    let
        charged =
            let
                chargedFromUplink =
                    if model.charging then
                        4
                    else
                        0

                chargedFromSolarPanels =
                    toFloat model.inventory.solarPanels * 0.75
            in
            chargedFromUplink + chargedFromSolarPanels
    in
    charged


netPowerPerSecond : Model -> Float
netPowerPerSecond model =
    let
        consumed =
            let
                base =
                    -- Some power is always lost to pod subsystems
                    1

                fabricator =
                    .power <| getFabricatorConsumption model
            in
            base + fabricator

        produced =
            powerGrowthPerSecond model
    in
    produced - consumed


tickPower : Float -> Model -> Model
tickPower dt model =
    let
        power =
            model.power

        nextPower =
            { power
                | curr =
                    power.curr
                        |> (+) (dt * netPowerPerSecond model)
                        |> Basics.min power.max
                        |> Basics.max 0
            }
    in
    { model | power = nextPower }


tickOxygen : Float -> Model -> Model
tickOxygen dt model =
    let
        { survivor } =
            model

        oxygen =
            model.oxygen

        nextOxygen =
            { oxygen
                | curr =
                    oxygen.curr
                        |> (+) (dt * oxygenPerSecond model)
                        |> Basics.min oxygen.max
                        |> Basics.max 0
            }

        -- Check for survivor death
        nextSurvivor =
            { survivor | dead = nextOxygen.curr == 0 }
    in
    { model
        | oxygen = nextOxygen
        , survivor = nextSurvivor
        , paused = nextSurvivor.dead
    }


tickMatterGrowth : Float -> Model -> Model
tickMatterGrowth dt model =
    let
        prev =
            model.matter

        next =
            { prev
                | curr =
                    prev.curr
                        |> (+) (dt * matterGrowthPerSecond model)
                        |> Basics.min prev.max
            }
    in
    { model | matter = next }


tickFabrication : Float -> Model -> Model
tickFabrication dt model =
    let
        { survivor, inventory, matter, power } =
            model
    in
    -- Nothing to do if there is no collected matter or no power
    if matter.curr == 0 || power.curr == 0 then
        model
    else
        case survivor.action of
            Action.Fabricating item { curr, max } ->
                let
                    ( matterConsumed, powerConsumed ) =
                        let
                            consumed =
                                getFabricatorConsumption model
                        in
                        ( consumed.matter
                            |> Basics.min matter.curr
                            |> (*) dt
                        , consumed.power
                            |> Basics.min power.curr
                            |> (*) dt
                        )

                    matterApplied =
                        matterConsumed * getFabricatorEfficiency model

                    nextMatter =
                        Quantity (matter.curr - matterConsumed) matter.max

                    nextPower =
                        Quantity (power.curr - powerConsumed) power.max
                in
                if curr + matterApplied >= max then
                    -- Item fabricated
                    { model
                        | survivor =
                            { survivor
                                | action = Action.Idling
                            }
                        , inventory =
                            case item of
                                Item.SolarPanel ->
                                    { inventory | solarPanels = inventory.solarPanels + 1 }

                                Item.MatterBin ->
                                    { inventory | matterBins = inventory.matterBins + 1 }
                        , matter =
                            case item of
                                Item.MatterBin ->
                                    { nextMatter | max = nextMatter.max + 100 }

                                _ ->
                                    nextMatter
                    }
                else
                    -- Item progressed
                    { model
                        | survivor =
                            { survivor
                                | action = Action.Fabricating item (Quantity (curr + matterApplied) max)
                            }
                        , matter = nextMatter
                        , power = nextPower
                    }

            _ ->
                model


tickAction : Float -> Model -> Model
tickAction dt model =
    let
        { survivor } =
            model
    in
    if survivor.suspended then
        -- Suspended survivor cannot act
        model
    else
        case survivor.action of
            Action.Idling ->
                model

            Action.Fabricating _ _ ->
                tickFabrication dt model

            Action.Researching ability ( curr, max ) ->
                if curr + dt >= max then
                    -- Research complete
                    { model
                        | abilities =
                            EverySet.insert ability model.abilities
                        , survivor =
                            { survivor
                                | action = Action.Idling
                            }
                    }
                else
                    -- Continue research
                    { model
                        | survivor =
                            { survivor
                                | action = Action.Researching ability ( curr + dt, max )
                            }
                    }


tickPod : Float -> Model -> Model
tickPod dt model =
    model
        |> tickPower dt
        |> tickOxygen dt
        |> tickMatterGrowth dt
        |> tickAction dt


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )

        DismissHelp ->
            ( { model | showHelp = False }, Cmd.none )

        SetPaused paused ->
            ( { model | paused = paused }, Cmd.none )

        Tick diff ->
            let
                dt =
                    Time.inSeconds diff

                nextModel =
                    tickPod dt model
            in
            ( nextModel, Cmd.none )

        SetCharging charging ->
            ( { model | charging = charging }
            , Cmd.none
            )

        SetSurvivorSuspension suspended ->
            let
                survivor =
                    model.survivor
            in
            ( { model | survivor = { survivor | suspended = suspended } }
            , Cmd.none
            )

        SetSurvivorAction action ->
            let
                survivor =
                    model.survivor
            in
            ( { model | survivor = { survivor | action = action } }
            , Cmd.none
            )

        SetPowerTarget powerTarget ->
            ( { model | powerTarget = powerTarget }
            , Cmd.none
            )

        SetActionTab tab ->
            ( { model | actionTab = tab }
            , Cmd.none
            )

        BeginFabricating item ->
            let
                { survivor } =
                    model

                price =
                    case item of
                        Item.SolarPanel ->
                            Price.priceOfSolarPanel model.inventory.solarPanels

                        Item.MatterBin ->
                            Price.priceOfMatterBin model.inventory.matterBins
            in
            ( { model
                | survivor =
                    { survivor
                        | action = Action.Fabricating item (Quantity 0 price)
                    }
              }
            , Cmd.none
            )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    if model.paused then
        Sub.none
    else
        Sub.batch
            [ AnimationFrame.diffs Tick
            , Port.mouseUp (\_ -> SetCharging False)
            ]



-- MAIN


main : Program Never Model Msg
main =
    Html.program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- VIEW


viewStats : Model -> Html Msg
viewStats model =
    Html.div
        []
        [ Html.div
            [ Hattrs.class "panel" ]
            [ Html.div [ Hattrs.class "panel-header" ] []
            , Html.div
                [ Hattrs.class "panel-body" ]
                [ Html.text "Survivor: "
                , Html.span
                    [ Hattrs.class <|
                        if model.survivor.suspended then
                            "text-green"
                        else
                            "text-red"
                    ]
                    [ Html.text <|
                        if model.survivor.suspended then
                            "Suspended"
                        else
                            "Conscious"
                    , Html.text <|
                        if model.survivor.suspended then
                            " 💤 "
                        else
                            " ❗ ️"
                    , Html.text " "
                    ]
                , if model.survivor.suspended then
                    Html.button
                        [ Hevents.onClick (SetSurvivorSuspension False)
                        , Hattrs.class "btn btn-sm"
                        ]
                        [ Html.text "Wake Up" ]
                  else
                    Html.button
                        [ Hevents.onClick (SetSurvivorSuspension True)
                        , Hattrs.class "btn btn-sm"
                        ]
                        [ Html.text "Suspend" ]

                -- Power
                , let
                    rate =
                        netPowerPerSecond model
                  in
                  Html.div
                    []
                    [ Html.span
                        []
                        [ Html.text "Power: "
                        , Html.text (Round.round 1 model.power.curr)
                        , Html.text "/"
                        , Html.text (Round.round 1 model.power.max)
                        , Html.text " "
                        , if rate >= 0 then
                            Html.span
                                [ Hattrs.class "text-green" ]
                                [ Html.text <| "+" ++ Round.round 1 rate ++ "/sec" ]
                          else
                            Html.span
                                [ Hattrs.class "text-red" ]
                                [ Html.text <| Round.round 1 rate ++ "/sec" ]
                        ]
                    , Spectre.meter
                        { value = model.power.curr
                        , min = 0
                        , max = model.power.max
                        , low = 25
                        , high = 50
                        , optimum = model.power.max
                        }
                    ]

                -- MATTER COLLECTOR
                , Html.div [ Hattrs.class "divider" ] []
                , Html.div
                    []
                    [ Html.text "Matter Collector "
                    , if model.powerTarget == MatterCollector then
                        Html.span [ Hattrs.class "label label-success" ] [ Html.text "Powered " ]
                      else
                        Html.button
                            [ Hevents.onClick (SetPowerTarget MatterCollector)
                            , Hattrs.class "btn btn-sm"
                            ]
                            [ Html.text "Divert Power" ]
                    ]
                , Html.div
                    []
                    [ -- MATTER
                      let
                        rate =
                            netMatterPerSecond model
                      in
                      Html.span
                        []
                        [ Html.text "Matter: "
                        , Html.text (Round.round 1 model.matter.curr)
                        , Html.text "/"
                        , Html.text (Round.round 1 model.matter.max)
                        , Html.text " "
                        , if rate >= 0 then
                            Html.span
                                [ Hattrs.class "text-green" ]
                                [ Html.text <| "+" ++ Round.round 1 rate ++ "/sec" ]
                          else
                            Html.span
                                [ Hattrs.class "text-red" ]
                                [ Html.text <| Round.round 1 rate ++ "/sec" ]
                        ]
                    , Spectre.meter
                        { value = model.matter.curr
                        , min = 0
                        , max = model.matter.max
                        , low = 0
                        , high = 0
                        , optimum = model.matter.max
                        }
                    ]

                -- LIFE SUPPORT
                , Html.div [ Hattrs.class "divider" ] []
                , Html.div
                    []
                    [ Html.text "Life Support "
                    , if model.powerTarget == LifeSupport then
                        Html.span [ Hattrs.class "label label-success" ] [ Html.text "Powered " ]
                      else
                        Html.button
                            [ Hevents.onClick (SetPowerTarget LifeSupport)
                            , Hattrs.class "btn btn-sm"
                            ]
                            [ Html.text "Divert Power" ]
                    ]
                , Html.div
                    []
                    [ -- OXYGEN
                      let
                        rate =
                            oxygenPerSecond model
                      in
                      Html.span
                        []
                        [ Html.text "Oxygen: "
                        , Html.text (Round.round 1 model.oxygen.curr)
                        , Html.text "/"
                        , Html.text (Round.round 1 model.oxygen.max)
                        , Html.text " "
                        , if rate >= 0 then
                            Html.span
                                [ Hattrs.class "text-green" ]
                                [ Html.text <| "+" ++ Round.round 1 rate ++ "/sec" ]
                          else
                            Html.span
                                [ Hattrs.class "text-red" ]
                                [ Html.text <| Round.round 1 rate ++ "/sec" ]
                        ]
                    , Spectre.meter
                        { value = model.oxygen.curr
                        , min = 0
                        , max = model.oxygen.max
                        , low = 25
                        , high = 50
                        , optimum = model.oxygen.max
                        }
                    ]
                ]
            , Html.div [ Hattrs.class "panel-footer" ] []
            ]
        ]


viewPowerUplink : Model -> Html Msg
viewPowerUplink model =
    Html.div
        [ Hattrs.class "panel" ]
        [ Html.div
            [ Hattrs.class "panel-header" ]
            [ Html.div
                [ Hattrs.class "panel-title" ]
                [ Html.text "Remote Power Uplink" ]
            ]
        , Html.div
            [ Hattrs.class "panel-body" ]
            [ Html.p
                []
                [ Html.button
                    [ Hevents.onMouseDown (SetCharging True)
                    , Hevents.onMouseUp (SetCharging False)
                    , Hattrs.style
                        [ ( "width", "100%" )
                        ]
                    , Hattrs.class "btn"
                    ]
                    [ if model.charging then
                        Html.span
                            []
                            [ Html.i [ Hattrs.class "fa fa-spinner fa-spin" ] []
                            , Html.text " Charging"
                            ]
                      else
                        Html.text "Click and hold to charge the pod remotely"
                    ]
                ]
            ]
        ]


viewInventory : Model -> Html Msg
viewInventory { inventory } =
    Html.div
        []
        [ Html.div
            [ Hattrs.class "panel" ]
            [ Html.div
                [ Hattrs.class "panel-header" ]
                [ Html.div
                    [ Hattrs.class "panel-title" ]
                    [ Html.text "Inventory" ]
                ]
            , Html.div
                [ Hattrs.class "panel-body" ]
                [ Html.ul
                    [ Hattrs.class "list-unstyled" ]
                    [ if inventory.solarPanels == 0 then
                        Html.text ""
                      else
                        Html.li
                            []
                            [ Html.text <| "Solar Panels: " ++ toString inventory.solarPanels
                            ]
                    ]
                ]
            ]
        ]


viewAbilities : Model -> Html Msg
viewAbilities { abilities } =
    Html.div
        []
        [ Html.div
            [ Hattrs.class "panel" ]
            [ Html.div
                [ Hattrs.class "panel-header" ]
                [ Html.div
                    [ Hattrs.class "panel-title" ]
                    [ Html.text "Abilities" ]
                ]
            , Html.div
                [ Hattrs.class "panel-body" ]
                [ Html.ul
                    [ Hattrs.class "list-unstyled" ]
                    (abilities
                        |> EverySet.toList
                        |> List.map (\a -> Html.li [] [ Html.text <| toString a ])
                    )
                ]
            ]
        ]


viewActions : Model -> Html Msg
viewActions model =
    Html.div
        []
        [ Html.ul
            [ Hattrs.class "tab tab-block" ]
            [ Html.li
                [ Hattrs.class <|
                    "tab-item "
                        ++ (case model.actionTab of
                                Fabrication ->
                                    "active"

                                _ ->
                                    ""
                           )
                ]
                [ Html.a
                    [ Hevents.onClick (SetActionTab Fabrication)
                    , Hattrs.href "javascript:void(0)"
                    ]
                    [ Html.text "Fabrication "
                    , case model.survivor.action of
                        Action.Fabricating _ { curr, max } ->
                            Html.span
                                [ Hattrs.class "label label-primary" ]
                                [ Html.text <| Round.round 2 (curr / max * 100) ++ "%" ]

                        _ ->
                            Html.text ""
                    ]
                ]
            , Html.li
                [ Hattrs.class <|
                    "tab-item "
                        ++ (case model.actionTab of
                                Research ->
                                    "active"

                                _ ->
                                    ""
                           )
                , Hevents.onClick (SetActionTab Research)
                ]
                [ Html.a
                    [ Hevents.onClick (SetActionTab Research)
                    , Hattrs.href "javascript:void(0)"
                    ]
                    [ Html.text "Research "
                    , case model.survivor.action of
                        Action.Researching _ ( curr, max ) ->
                            Html.span
                                [ Hattrs.class "label label-primary" ]
                                [ Html.text <| Round.round 2 (curr / max * 100) ++ "%" ]

                        _ ->
                            Html.text ""
                    ]
                ]
            ]
        , case model.actionTab of
            Fabrication ->
                viewFabricationTab model

            Research ->
                viewResearchTab model
        ]


viewFabricationTab : Model -> Html Msg
viewFabricationTab model =
    Html.div
        []
        [ let
            efficiency =
                getFabricatorEfficiency model

            percentString =
                (Round.round 2 <| efficiency * 100) ++ "%"
          in
          Html.p
            []
            [ Html.strong
                []
                [ Html.text <| percentString ++ " Efficiency: " ]
            , Html.text <| "For every 1.00 matter consumed, " ++ Round.round 2 efficiency ++ " matter is fabricated."
            ]
        , Html.p
            []
            [ Html.text "The survivor can build itemswhile they are conscious and there is matter in the matter collector." ]
        , Html.ul
            []
            [ let
                isSelected =
                    case model.survivor.action of
                        Action.Fabricating Item.SolarPanel _ ->
                            True

                        _ ->
                            False
              in
              Html.li
                [ Hevents.onClick <|
                    if isSelected then
                        NoOp
                    else
                        BeginFabricating Item.SolarPanel
                ]
                [ Html.button
                    [ Hattrs.classList
                        [ ( "btn", True )
                        , ( "btn-primary", isSelected )
                        ]
                    , Hattrs.disabled isSelected
                    ]
                    [ Html.text "Solar Panel"
                    ]
                , Html.text " Solar panels allow the pod to charge passively"
                ]
            , let
                isSelected =
                    case model.survivor.action of
                        Action.Fabricating Item.MatterBin _ ->
                            True

                        _ ->
                            False
              in
              Html.li
                [ Hevents.onClick <|
                    if isSelected then
                        NoOp
                    else
                        BeginFabricating Item.MatterBin
                ]
                [ Html.button
                    [ Hattrs.classList
                        [ ( "btn", True )
                        , ( "btn-primary", isSelected )
                        ]
                    , Hattrs.disabled isSelected
                    ]
                    [ Html.text "Matter Bin"
                    ]
                , Html.text " +100 max matter storage"
                ]
            ]
        ]


viewResearchTab : Model -> Html Msg
viewResearchTab model =
    Html.div
        []
        [ Html.p
            []
            [ Html.text "The survivor can research upgrades while they are conscious." ]
        , Html.ul
            []
            [ let
                isSelected =
                    case model.survivor.action of
                        Action.Researching Ability.ShallowBreathing _ ->
                            True

                        _ ->
                            False
              in
              if EverySet.member Ability.ShallowBreathing model.abilities then
                Html.text ""
              else
                Html.li
                    [ Hevents.onClick (SetSurvivorAction (Action.Researching Ability.ShallowBreathing ( 0, 5 ))) ]
                    [ Html.button
                        [ Hattrs.classList
                            [ ( "btn", True )
                            , ( "btn-primary", isSelected )
                            ]
                        , Hattrs.disabled isSelected
                        ]
                        [ Html.text "Shallow Breathing"
                        ]
                    , Html.text " Survivor consumes less oxygen while conscious"
                    ]
            , let
                isSelected =
                    case model.survivor.action of
                        Action.Researching Ability.Engineering _ ->
                            True

                        _ ->
                            False
              in
              Html.li
                [ Hevents.onClick (SetSurvivorAction (Action.Researching Ability.Engineering ( 0, 100 ))) ]
                [ Html.button
                    [ Hattrs.classList
                        [ ( "btn", True )
                        , ( "btn-primary", isSelected )
                        ]
                    , Hattrs.disabled isSelected
                    ]
                    [ Html.text "Engineering"
                    ]
                , Html.text " Survivor becomes more efficient with fabricator"
                ]
            ]
        ]


viewDeathMessage : Html Msg
viewDeathMessage =
    Html.div
        [ Hattrs.class "toast" ]
        [ Html.div
            []
            [ Html.p [] [ Html.strong [] [ Html.text "Your survivor has died." ] ]
            , Html.text " Thanks for checking out this crude lil demo."
            ]
        ]


viewHelp : Html Msg
viewHelp =
    Html.div
        []
        [ Html.p
            []
            [ Html.text """
                An escape pod has crash-landed on a planet with a single survivor.
            """ ]
        , Html.p
            []
            [ Html.text """
                The survivor can be suspended in the pod's stasis goo to consume very few resources.
                Or you can wake them up to build / research improvements that will help them get
                off the planet.
            """
            ]
        , Html.ul
            []
            [ Html.li [] [ Html.text """
                The pod's weak energy grid can only power either the matter collector or the life support system
             """ ]
            , Html.li [] [ Html.text """
                Until you fabricate some energy subsystems, you'll have to click and hold on the Power
                Uplink button to charge the pod remotely.
             """ ]
            , Html.li [] [ Html.text """
                The survivor can only work on their task when conscious.
             """ ]
            , Html.li [] [ Html.text """
                The survivor dies once any of the life support vitals reaches zero.
             """ ]
            , Html.li [] [ Html.text """
                Fabrication costs power and matter. Research only costs time.
             """ ]
            ]
        , Html.button
            [ Hevents.onClick DismissHelp
            , Hattrs.class "btn"
            ]
            [ Html.text "Dismiss Help" ]
        ]


viewPauseButton : Model -> Html Msg
viewPauseButton model =
    Html.button
        [ Hevents.onClick (SetPaused (not model.paused))
        , Hattrs.class "btn"
        ]
        [ Html.text <|
            if model.paused then
                "Unpause"
            else
                "Pause"
        ]


view : Model -> Html Msg
view model =
    Html.div
        [ Hattrs.class "container grid-1280" ]
        [ if model.survivor.dead then
            viewDeathMessage
          else
            Html.text ""
        , if model.showHelp then
            viewHelp
          else
            Html.text ""
        , Html.div
            [ Hattrs.class "columns" ]
            [ Html.div
                [ Hattrs.class "column col-4 col-xs-12" ]
                [ viewStats model
                , Html.p
                    [ Hattrs.class "text-center" ]
                    [ viewPauseButton model ]
                , if Inventory.isEmpty model.inventory then
                    Html.text ""
                  else
                    viewInventory model
                , if EverySet.isEmpty model.abilities then
                    Html.text ""
                  else
                    viewAbilities model
                ]
            , Html.div
                [ Hattrs.class "column col-8 col-xs-12" ]
                [ viewPowerUplink model
                , viewActions model
                ]
            ]

        -- , Html.div [] [ Html.text <| toString model ]
        ]
