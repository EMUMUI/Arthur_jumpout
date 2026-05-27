--- ============================================================
--- 注册区: 服务端事件
--- ============================================================
local playerCooldowns = {}

RegisterServerEvent("Arthur_jumpout:tacklePlayer", function(targetServerId, chargeLevel)
    local attacker = source
    local target = tonumber(targetServerId)

    if not target or target == attacker then
        return
    end

    local currentTime = GetGameTimer()
    local lastUse = playerCooldowns[attacker] or 0

    if currentTime - lastUse < Config.cooldown then
        return
    end
    playerCooldowns[attacker] = currentTime

    local attackerPed = GetPlayerPed(attacker)
    if not DoesEntityExist(attackerPed) then
        return
    end

    local targetPed = GetPlayerPed(target)
    if not DoesEntityExist(targetPed) then
        return
    end

    local attackerCoords = GetEntityCoords(attackerPed)
    local targetCoords = GetEntityCoords(targetPed)

    local distance = #(attackerCoords - targetCoords)
    if distance > Config.maxTackleDistance + Config.tackleRadius + 1.0 then
        return
    end

    chargeLevel = tonumber(chargeLevel) or 0
    if chargeLevel < 0 or chargeLevel > 1.0 then
        chargeLevel = 0
    end

    TriggerClientEvent("Arthur_jumpout:playTackledAnim", target, attacker)
end)
