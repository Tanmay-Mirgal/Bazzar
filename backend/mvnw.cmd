@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM --------------------------------------------------------------------------
@REM Maven Wrapper startup script for Windows
@REM --------------------------------------------------------------------------
@IF "%__MVNW_ARG0_NAME__%"=="" (SET "MAVEN_JAVA_EXE=%JAVA_EXE%") ELSE (SET "MAVEN_JAVA_EXE=%JAVA_EXE%")
@SET MAVEN_CMD_LINE_ARGS=%*

@SET WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
@SET WRAPPER_PROPERTIES="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties"
@SET WRAPPER_OPTS=-Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECTBASEDIR%"

@IF NOT "%JAVA_HOME%"=="" (
    SET "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
)

@IF "%JAVA_EXE%"=="" SET "JAVA_EXE=java"

@"%JAVA_EXE%" %JVM_CONFIG_MAVEN_PROPS% %MAVEN_OPTS% %MAVEN_DEBUG_OPTS% -classpath "%WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" org.apache.maven.wrapper.MavenWrapperMain %MAVEN_CMD_LINE_ARGS%
@IF ERRORLEVEL 1 GOTO error
@GOTO end
:error
SET ERROR_CODE=1
:end
@ENDLOCAL & SET ERROR_CODE=%ERROR_CODE%
@IF NOT "%SUREFIRE_TIMEOUT%"=="" (EXIT /B %ERROR_CODE%)
@EXIT /B %ERROR_CODE%
