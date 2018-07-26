package handlers

import (
	"net/http"

	"github.com/byuoitav/common/auth"
	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/structs"
	"github.com/labstack/echo"
)

// GetUIConfig returns a room's UI config.
func GetUIConfig(context echo.Context) error {
	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
		if err != nil {
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	var config structs.UIConfig

	roomID := context.Param("room")

	config, err := db.GetDB().GetUIConfig(roomID)
	if err != nil {
		log.L.Errorf("Problem getting UI Config for %s : %v", roomID, err.Error())
		return context.JSON(http.StatusBadRequest, err)
	}

	return context.JSON(http.StatusOK, config)
}
