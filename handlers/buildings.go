package handlers

import (
	"net/http"

	"github.com/byuoitav/av-api/dbo"
	"github.com/labstack/echo"
)

func getAllBuildings(context echo.Context) error {
	buildings, err := dbo.GetBuildings()
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}
	return context.JSON(http.StatusOK, buildings)
}
