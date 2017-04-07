package handlers

import (
	"net/http"

	"github.com/byuoitav/av-api/dbo"
	"github.com/byuoitav/configuration-database-microservice/accessors"
	"github.com/labstack/echo"
)

func GetDevicesByRoom(context echo.Context) error {

	building := context.Param("building")
	room := context.Param("room")

	devices, err := dbo.GetDevicesByRoom(building, room)
	if err != nil {
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	return context.JSON(http.StatusOK, devices)
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
