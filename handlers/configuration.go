package handlers

import (
	"net/http"

	"github.com/byuoitav/av-api/dbo"
	"github.com/byuoitav/configuration-database-microservice/accessors"
	"github.com/labstack/echo"
)

type Configuration struct {
	DeviceTypes   []accessors.DeviceType
	PowerStates   []accessors.PowerState
	Ports         []accessors.PortType
	Commands      []accessors.RawCommand
	Microservices []accessors.Microservice
	Endpoints     []accessors.Endpoint
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

	return
}
