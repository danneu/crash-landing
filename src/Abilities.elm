module Abilities
    exposing
        ( Abilities
        , descriptionOf
        , empty
        , insert
        , isEmpty
        , member
        , toList
        )

import Ability exposing (Ability)
import EverySet exposing (EverySet)
import Time


type Abilities
    = Abilities (EverySet Ability)


empty : Abilities
empty =
    Abilities EverySet.empty


isEmpty : Abilities -> Bool
isEmpty (Abilities set) =
    EverySet.isEmpty set


insert : Ability -> Abilities -> Abilities
insert k (Abilities set) =
    Abilities (EverySet.insert k set)


member : Ability -> Abilities -> Bool
member k (Abilities set) =
    EverySet.member k set


toList : Abilities -> List Ability
toList (Abilities set) =
    EverySet.toList set



------------------------------------------------------------


descriptionOf : Ability -> String
descriptionOf ability =
    case ability of
        Ability.ShallowBreathing ->
            "Survivor consumes less oxygen while conscious"

        Ability.Engineering ->
            "Survivor becomes more efficient with the fabricator"
