@echo off
chcp 65001 >nul
echo =======================================================
echo          ApexFlow 待办台账 - Windows EXE 一键打包工具
echo =======================================================
echo.

echo [1/3] 检查并安装项目依赖...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [错误] 依赖安装失败，请检查网络或 Node.js 环境。
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] 正在编译前端静态资源包...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [错误] 前端构建失败。
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] 正在使用 Electron 打包生成 Windows EXE 可执行文件...
call npx electron-builder --win --x64
if %ERRORLEVEL% neq 0 (
    echo [错误] 打包 EXE 失败。
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo =======================================================
echo [成功] 打包完成！
echo EXE 可执行文件已生成在: dist-electron 文件夹中
echo =======================================================
echo.
pause
