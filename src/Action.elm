module Action exposing (..)

import Ability exposing (Ability)
import Item exposing (Item)
import Quantity exposing (Quantity)


type alias SpaceSuit =
    { power : Quantity
    , oxygen : Quantity
    , food : Quantity
    }


{-| Seconds elapsed vs total duration in seconds
-}
type alias ProgressInSeconds =
    ( Float, Float )


{-| Represents the survivor's action when conscious
-}
type Action
    = Idling
    | Fabricating Item Quantity
    | Researching Ability ProgressInSeconds



--| Exploring SpaceSuit ProgressInSeconds
