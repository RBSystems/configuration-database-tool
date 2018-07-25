package handlers

import (
	"net/http"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/structs"
	"github.com/labstack/echo"
)

// GetUIConfig returns a room's UI config.
func GetUIConfig(context echo.Context) error {
	log.L.Debug("[uiconfig] Starting GetUIConfig...")

	// ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
	// if err != nil {
	// 	log.L.Errorf("[uiconfig] Failed to verify read role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
	// 	return context.JSON(http.StatusInternalServerError, err.Error())
	// }
	// if !ok {
	// 	log.L.Warnf("[uiconfig] User %s is not allowed to get a UI Config.", context.Request().Context().Value("user").(string))
	// 	return context.JSON(http.StatusForbidden, alert)
	// }

	var config structs.UIConfig

	roomID := context.Param("room")

	log.L.Debugf("[uiconfig] Attempting to get the UI Config for %s", roomID)

	config, err := db.GetDB().GetUIConfig(roomID)
	if err != nil {
		log.L.Errorf("[uiconfig] Problem getting UI Config for %s : %v", roomID, err.Error())
		return context.JSON(http.StatusBadRequest, err)
	}

	log.L.Debugf("[uiconfig] Successfully got the UI Config for %s!", roomID)
	return context.JSON(http.StatusOK, config)
}
