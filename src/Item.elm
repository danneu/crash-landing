module Item exposing (..)


type Item
    = -- Permanent
      SolarPanel
    | MatterBin
      -- Status Effects
    | Amphetamine



-- TODO: Use real growth funcs


matterCostOf : Item -> Int -> Float
matterCostOf item quantity =
    case item of
        SolarPanel ->
            20 + (toFloat quantity * 20)

        MatterBin ->
            20 + (toFloat quantity * 20)

        Amphetamine ->
            12
