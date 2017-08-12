module Fabricator exposing (..)

import Item exposing (Item)
import Quantity exposing (Quantity)


type Fabricator
    = Empty
    | Loaded Item Quantity


empty : Fabricator
empty =
    Empty


load : Item -> Float -> Fabricator
load item price =
    Loaded item (Quantity 0 price)
