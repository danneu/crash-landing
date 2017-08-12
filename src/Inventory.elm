module Inventory exposing (..)


type alias Inventory =
    { solarPanels : Int
    , matterBins : Int
    }


empty : Inventory
empty =
    { solarPanels = 0
    , matterBins = 0
    }


size : Inventory -> Int
size inventory =
    List.sum
        [ inventory.solarPanels
        , inventory.matterBins
        ]


isEmpty : Inventory -> Bool
isEmpty inventory =
    0 == size inventory
