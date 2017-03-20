package handlers

import (
	"net/http"

	"github.com/byuoitav/av-api/dbo"
	"github.com/byuoitav/configuration-database-microservice/accessors"
	"github.com/labstack/echo"
)

func GetBuildings(context echo.Context) error {
	buildings, err := dbo.GetBuildings()
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}
	return context.JSON(http.StatusOK, buildings)
}

// AddBuilding asdf
func AddBuilding(context echo.Context) error {
	shortname := context.Param("building")
	var building accessors.Building
	context.Bind(&building)
	if building.Shortname != shortname && len(building.Shortname) > 0 {
		return context.JSON(http.StatusBadRequest, "Invalid body. Resource address and shortname must match")
	}
	dbo.AddBuilding(building)
}
