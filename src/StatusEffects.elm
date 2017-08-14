module StatusEffects
    exposing
        ( StatusEffect(..)
        , StatusEffects
        , descriptionOf
        , empty
        , insert
        , isEmpty
        , member
        , tick
        , viewSidebar
        )

import EveryDict exposing (EveryDict)
import Html
import Html.Attributes
import Round
import Time


type
    StatusEffect
    -- Suppressed conscious appetite and increases productivity with fabricator
    = Amphetamine


{-| This module was written after Inventory.elm. I want to
experiment with an EverySet instead like the Abilities
set. I figure this inventory is for items that you only make once.
-}
type alias StatusEffects =
    EveryDict StatusEffect ( Float, Float )


empty : StatusEffects
empty =
    EveryDict.empty


isEmpty : StatusEffects -> Bool
isEmpty =
    EveryDict.isEmpty


insert : StatusEffect -> StatusEffects -> StatusEffects
insert effect =
    EveryDict.insert effect ( 0, durationOf effect )


member : StatusEffect -> StatusEffects -> Bool
member key =
    EveryDict.member key


durationOf : StatusEffect -> Float
durationOf effect =
    Time.inSeconds <|
        case effect of
            Amphetamine ->
                Time.minute * 3


descriptionOf : StatusEffect -> String
descriptionOf effect =
    case effect of
        Amphetamine ->
            "Survivor consumes less food when conscious and works harder"



-- UPDATE


{-| Ticks each effect and evicts them when they expire.
-}
tick : Float -> StatusEffects -> StatusEffects
tick dt effects =
    let
        updater k ( curr, max ) =
            ( curr + dt, max )
    in
    effects
        |> EveryDict.map (\_ ( curr, max ) -> ( curr + dt, max ))
        |> EveryDict.filter (\_ ( curr, max ) -> curr < max)



-- VIEW


viewEffect : StatusEffect -> ( Float, Float ) -> Html.Html msg
viewEffect effect ( curr, max ) =
    Html.li
        []
        [ Html.strong [] [ Html.text <| toString effect ++ ": " ]
        , Html.text <| Round.round 0 (max - curr) ++ " seconds"
        , Html.div [] [ Html.text (descriptionOf effect) ]
        ]


viewSidebar : StatusEffects -> Html.Html msg
viewSidebar effects =
    Html.div
        []
        [ Html.div
            [ Html.Attributes.class "panel" ]
            [ Html.div
                [ Html.Attributes.class "panel-header" ]
                [ Html.div
                    [ Html.Attributes.class "panel-title" ]
                    [ Html.text "Temporary Effects" ]
                ]
            , Html.div
                [ Html.Attributes.class "panel-body" ]
                [ Html.ul
                    [ Html.Attributes.class "list-unstyled" ]
                    (effects
                        |> EveryDict.toList
                        |> List.map (\( k, v ) -> viewEffect k v)
                    )
                ]
            ]
        ]
