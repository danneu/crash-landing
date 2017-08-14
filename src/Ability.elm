module Ability exposing (..)

import Time


type Ability
    = -- Reduce oxygen consumption while conscious
      ShallowBreathing
      -- Improve fabricator efficiency
    | Engineering


{-| Returns seconds
-}
priceOf : Ability -> Float
priceOf ability =
    let
        millis =
            case ability of
                ShallowBreathing ->
                    30 * Time.second

                Engineering ->
                    45 * Time.second
    in
    Time.inSeconds millis
