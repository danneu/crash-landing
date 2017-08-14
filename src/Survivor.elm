module Survivor exposing (..)

import Action exposing (Action)


type alias Survivor =
    { suspended : Bool
    , dead : Bool
    , action : Action
    }


init : Survivor
init =
    { suspended = True
    , dead = False
    , action = Action.Idling
    }


isSuspended : Survivor -> Bool
isSuspended =
    .suspended


isIdling : Survivor -> Bool
isIdling survivor =
    case survivor.action of
        Action.Idling ->
            True

        _ ->
            False


isFabricating : Survivor -> Bool
isFabricating survivor =
    case survivor.action of
        Action.Fabricating _ _ ->
            True

        _ ->
            False


isResearching : Survivor -> Bool
isResearching survivor =
    case survivor.action of
        Action.Researching _ _ ->
            True

        _ ->
            False
