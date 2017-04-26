package handlers

import (
	"net/http"

	"github.com/byuoitav/av-api/dbo"
	"github.com/labstack/echo"
)

func GetRoomConfigurations(context echo.Context) error {
	configurations, err := dbo.GetRoomConfigurations()
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}
	return context.JSON(http.StatusOK, configurations)
}
