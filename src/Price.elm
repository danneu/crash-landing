module Price exposing (..)

-- TODO: Use real growth funcs
--- TODO: Use item.matterCostOf instead


priceOfSolarPanel : Int -> Float
priceOfSolarPanel count =
    20 + (toFloat count * 20)


priceOfMatterBin : Int -> Float
priceOfMatterBin count =
    20 + (toFloat count * 20)
