lib.locale()
local config = require 'config.general'
local model = config.Prop.Model
local Position, Rotation = config.Prop.Position, config.Prop.Rotation
local prop = nil

local function UseCalculator()
    if prop then return end
    SetNuiFocus(true, true)
    SendNUIMessage({ action = "open", type = "calculator" })
    local player = cache.ped
    lib.requestModel(model)
    prop = CreateObject(model, 1.0, 1.0, 1.0, true, true, false)
    AttachEntityToEntity(prop, player, GetPedBoneIndex(player, 28422), Position, Rotation, true, true, false, true, 2, true)
    SetModelAsNoLongerNeeded(model)
    lib.playAnim(player, "amb@world_human_stand_mobile_fat@male@text@base", "base", 2.0, -2.0, -1, 1, 0, false, false, false)
end

RegisterNUICallback("close", function(_, cb)
    SetNuiFocus(false, false)
    SendNUIMessage({ action = "close", type = "calculator" })
    DeleteEntity(prop)
    prop = nil
    ClearPedTasks(cache.ped)
    cb("ok")
end)

if config.EnableCommand then
    RegisterCommand(config.CommandName, function()
        UseCalculator()
    end, false)
end

exports('UseCalculator', UseCalculator)