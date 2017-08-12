module Action exposing (..)

import Ability exposing (Ability)
import Item exposing (Item)
import Quantity exposing (Quantity)


{-| Represents the survivor's action when conscious
-}
type Action
    = Idling
    | Fabricating Item Quantity
    | Researching Ability ( Float, Float ) -- (Seconds, Seconds)
