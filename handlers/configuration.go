package handlers

import (
	"net/http"

	"github.com/byuoitav/av-api/dbo"
	"github.com/byuoitav/configuration-database-microservice/accessors"
	"github.com/labstack/echo"
)

type Configuration struct {
	DeviceTypes           []accessors.DeviceType
	DeviceClasses         []accessors.DeviceClass
	PowerStates           []accessors.PowerState
	Ports                 []accessors.PortType
	Commands              []accessors.RawCommand
	Microservices         []accessors.Microservice
	Endpoints             []accessors.Endpoint
	DeviceRoleDefinitions []accessors.DeviceRoleDef
}

func GetConfiguration(context echo.Context) error {
	output, err := buildConfiguration()
	if err != nil {
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	return context.JSON(http.StatusOK, output)
}

func buildConfiguration() (output Configuration, err error) {
	output.DeviceTypes, err = dbo.GetDeviceTypes()
	if err != nil {
		return
	}

	output.PowerStates, err = dbo.GetPowerStates()
	if err != nil {
		return
	}

	output.Ports, err = dbo.GetPorts()
	if err != nil {
		return
	}

	output.Commands, err = dbo.GetAllRawCommands()
	if err != nil {
		return
	}

	output.Microservices, err = dbo.GetMicroservices()
	if err != nil {
		return
	}

	output.Endpoints, err = dbo.GetEndpoints()
	if err != nil {
		return
	}

	output.DeviceClasses, err = dbo.GetDeviceClasses()
	if err != nil {
		return
	}

	output.DeviceRoleDefinitions, err = dbo.GetDeviceRoleDefinitions()
	if err != nil {
		return
	}

	return
}

func AddCommand(context echo.Context) error {
	cmdName := context.Param("command")
	var cmdToAdd accessors.RawCommand

	context.Bind(&cmdToAdd)
	if cmdName != cmdToAdd.Name {
		return context.JSON(http.StatusBadRequest, "Invalid body. Resource address and name must match")
	}

	cmdAdded, err := dbo.AddRawCommand(cmdToAdd)
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	return context.JSON(http.StatusOK, cmdAdded)
}

func AddPort(context echo.Context) error {
	portName := context.Param("port")
	var portToAdd accessors.PortType

	context.Bind(&portToAdd)
	if portName != portToAdd.Name {
		return context.JSON(http.StatusBadRequest, "Invalid body. Resource address and shortname must match")
	}

	portAdded, err := dbo.AddPort(portToAdd)
	if err != nil {
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	return context.JSON(http.StatusOK, portAdded)
}

func AddEndpoint(context echo.Context) error {
	name := context.Param("endpoint")
	var toAdd accessors.Endpoint

	context.Bind(&toAdd)
	if name != toAdd.Name {
		return context.JSON(http.StatusBadRequest, "Invalid body. Resource address and shortname must match")
	}

	endpoint, err := dbo.AddEndpoint(toAdd)
	if err != nil {
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	return context.JSON(http.StatusOK, endpoint)
}

func AddPowerState(context echo.Context) error {
	name := context.Param("powerstate")
	var toAdd accessors.PowerState

	context.Bind(&toAdd)
	if name != toAdd.Name {
		return context.JSON(http.StatusBadRequest, "Invalid body. Resource address and shortname must match")
	}

	powerState, err := dbo.AddPowerState(toAdd)
	if err != nil {
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	return context.JSON(http.StatusOK, powerState)
}

func AddMicroservice(context echo.Context) error {
	name := context.Param("microservice")
	var toAdd accessors.Microservice

	context.Bind(&toAdd)
	if name != toAdd.Name {
		return context.JSON(http.StatusBadRequest, "Invalid body. Resource address and shortname must match")
	}

	microservice, err := dbo.AddMicroservice(toAdd)
	if err != nil {
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	return context.JSON(http.StatusOK, microservice)
}

func AddDeviceType(context echo.Context) error {
	name := context.Param("devicetype")
	var toAdd accessors.DeviceType

	context.Bind(&toAdd)
	if name != toAdd.Name {
		return context.JSON(http.StatusBadRequest, "Invalid body. Resource address and shortname must match")
	}

	deviceType, err := dbo.AddDeviceType(toAdd)
	if err != nil {
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	return context.JSON(http.StatusOK, deviceType)
}

func AddRoleDefinition(context echo.Context) error {
	name := context.Param("deviceroledefinition")
	var toAdd accessors.DeviceRoleDef

	context.Bind(&toAdd)
	if name != toAdd.Name {
		return context.JSON(http.StatusBadRequest, "Invalid body. Resource address and shortname must match")
	}

	roleDefinition, err := dbo.AddRoleDefinition(toAdd)
	if err != nil {
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	return context.JSON(http.StatusOK, roleDefinition)
}
