--- ============================================================
--- 执行区: 服务端初始化
--- ============================================================
AddEventHandler("onResourceStart", function(resourceName)
    if GetCurrentResourceName() == resourceName then
        print("^2[Arthur Jumpout]^7 Server script loaded successfully")
    end
end)
