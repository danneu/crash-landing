module Spectre exposing (..)

import Html exposing (Html)
import Html.Attributes as Hattrs
import Json.Encode as JE
import Round


type alias Meter =
    { value : Float
    , min : Float
    , max : Float
    , low : Float
    , high : Float
    , optimum : Float
    }


meter : Meter -> Html msg
meter { value, min, max, low, high, optimum } =
    Html.meter
        [ Hattrs.class "meter"
        , Hattrs.value <| toString value
        , Hattrs.min <| toString min
        , Hattrs.max <| toString max
        , Hattrs.property "low" (JE.string <| toString low)
        , Hattrs.property "high" (JE.string <| toString high)
        , Hattrs.property "optimum" (JE.string <| toString optimum)
        ]
        []


type alias ProgressBar =
    { value : Float
    , max : Float
    }



-- percent is 0 (0%) to 1 (100%)


progressBar : Float -> Html msg -> Html msg
progressBar percent body =
    Html.div
        [ Hattrs.class "bar" ]
        [ Html.div
            [ Hattrs.class "bar-item"
            , Hattrs.style
                [ ( "width", Round.round 1 (percent * 100) ++ "%" )
                ]
            ]
            [ body ]
        ]
