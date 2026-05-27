--- ============================================================
--- 注册区: NUI 事件收发
--- ============================================================
function SendNUIEvent(action, data)
    SendNUIMessage({
        action = action,
        data = data
    })
end

--- ============================================================
--- 回调区: NUI Callbacks
--- ============================================================
RegisterNUICallback("jumpout_ready", function(_, cb)
    cb({ ok = true })
end)

--- ============================================================
--- 注册区: 键盘映射 & 命令
--- ============================================================
RegisterCommand("+Arthur_jumpout_charge", function()
    local ped = PlayerPedId()

    if IsPedInAnyVehicle(ped, true) then
        return
    end

    if not IsPedSprinting(ped) then
        SendNUIEvent("showNotification", {
            type = "warning",
            text = "需要在疾跑状态下使用",
            duration = 2000
        })
        return
    end

    if Tackle.isOnCooldown then
        return
    end

    Charge.start()

    SendNUIEvent("chargeStart", {
        maxTime = Config.maxChargeTime
    })
end, false)

RegisterCommand("-Arthur_jumpout_charge", function()
    local success, chargeLevel, speedMult = Charge.release()

    if success and chargeLevel > 0.1 then
        local tackleSuccess = Tackle.perform(chargeLevel)

        if tackleSuccess then
            Tackle.playAttackerAnimation()
        end
    end

    SendNUIEvent("chargeEnd", {})
end, false)

RegisterKeyMapping("+Arthur_jumpout_charge", "Arthur Jumpout - 蓄力扑倒", "keyboard", "G")

--- ============================================================
--- 注册区: 网络事件
--- ============================================================
RegisterNetEvent("Arthur_jumpout:playTackledAnim", function(attackerServerId)
    local ped = PlayerPedId()
    Tackle.playBadgerTackleVictim(ped, attackerServerId)
end)

--- ============================================================
--- 执行区: 冷却 HUD 线程
--- ============================================================
CreateThread(function()
    while true do
        Wait(100)

        if Tackle.isOnCooldown then
            SendNUIEvent("cooldownUpdate", {
                active = true
            })
        else
            SendNUIEvent("cooldownUpdate", {
                active = false
            })
        end
    end
end)

--- ============================================================
--- 执行区: 初始化
--- ============================================================
AddEventHandler("onResourceStart", function(resourceName)
    if GetCurrentResourceName() == resourceName then
        SendNUIEvent("showNotification", {
            type = "success",
            text = "Arthur Jumpout 已加载",
            duration = 2000
        })
    end
end)
