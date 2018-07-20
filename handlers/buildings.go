package handlers

import (
	"net/http"

	"github.com/byuoitav/common/auth"
	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/structs"
	"github.com/labstack/echo"
)

var alert = "This action is not allowed."

// GetBuildings returns a list of all the buildings in the database.
func GetBuildings(context echo.Context) error {
	ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
	if err != nil {
		return context.JSON(http.StatusInternalServerError, err.Error())
	}
	if !ok {
		return context.JSON(http.StatusForbidden, alert)
	}

	buildings, err := db.GetDB().GetAllBuildings()
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}
	return context.JSON(http.StatusOK, buildings)
}

// AddBuilding adds a new building to the database.
func AddBuilding(context echo.Context) error {
	ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "write")
	if err != nil {
		return context.JSON(http.StatusInternalServerError, err.Error())
	}
	if !ok {
		return context.JSON(http.StatusForbidden, alert)
	}

	shortname := context.Param("building")
	var building structs.Building
	context.Bind(&building)
	if building.ID != shortname && len(building.ID) > 0 {
		return context.JSON(http.StatusBadRequest, "Invalid body. Resource address and id must match")
	}
	building, err = db.GetDB().CreateBuilding(building)
	if err != nil {
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	return context.JSON(http.StatusOK, building)
}

// GetBuildingByID returns a specific building based on the given ID.
func GetBuildingByID(context echo.Context) error {
	ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
	if err != nil {
		return context.JSON(http.StatusInternalServerError, err.Error())
	}
	if !ok {
		return context.JSON(http.StatusForbidden, alert)
	}

	id := context.Param("building")
	building, err := db.GetDB().GetBuilding(id)
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}
	return context.JSON(http.StatusOK, building)
}

// UpdateBuilding updates a building in the database.
func UpdateBuilding(context echo.Context) error {
	ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "write")
	if err != nil {
		return context.JSON(http.StatusInternalServerError, err.Error())
	}
	if !ok {
		return context.JSON(http.StatusForbidden, alert)
	}

	id := context.Param("building")
	var building structs.Building
	context.Bind(&building)
	if building.ID != id && len(building.ID) > 0 {
		return context.JSON(http.StatusBadRequest, "Invalid body. Resource address and id must match")
	}
	building, err = db.GetDB().UpdateBuilding(id, building)
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}
	return context.JSON(http.StatusOK, building)
}
