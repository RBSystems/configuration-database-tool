package handlers

import (
	"net/http"
	"time"

	"github.com/byuoitav/common/auth"
	"github.com/byuoitav/common/log"
	"github.com/labstack/echo"
)

// Status returns the health status of the application.
func Status(context echo.Context) error {
	// SS.StartTime = Start.Format(time.UnixDate)

	// SS.Uptime = time.Since(Start).Round(time.Second).String()

	// SS.Message = fmt.Sprintf("Today's the day! The sun is shining, the tank is clean, and we are getting out of... *gasp* the tank is clean. THE TANK IS CLEAN!!")

	// b, err := json.MarshalIndent(SS, "", "    ")
	// if err != nil {
	// 	log.L.Warnf("[health] Failed to marshal the ServerStatus : %v", err.Error())
	// }

	return context.String(http.StatusOK, "ok")
}

// SS is a variable representing a ServerStatus object.
var SS ServerStatus

// Start is the time that the server started in time.Time format.
var Start time.Time

// ServerStatus contains the information about the status of the server.
type ServerStatus struct {
	StartTime        string `json:"start_time"`
	Uptime           string `json:"uptime"`
	BuildingsCreated int    `json:"buildings_created"`
	BuildingsUpdated int    `json:"buildings_updated"`
	RoomsCreated     int    `json:"rooms_created"`
	RoomsUpdated     int    `json:"rooms_updated"`
	DevicesCreated   int    `json:"devices_created"`
	DevicesUpdated   int    `json:"devices_updated"`
	UIConfigsCreated int    `json:"uiconfigs_created"`
	UIConfigsUpdated int    `json:"uiconfigs_updated"`
	Message          string `json:"message"`
}

// Dev tracks if the server is being used for development or not at the moment.
var Dev bool

// SetDev allows the server to be set into a "development" state, or takes it out of said state.
func SetDev(context echo.Context) error {
	state := context.Param("state")

	var msg string
	if state == "true" {
		Dev = true
		msg = "Development state = true"
	} else {
		Dev = false
		msg = "Development state = false"
	}

	return context.JSON(http.StatusOK, msg)
}

// HasAdminRights verifies whether or not the user has administrative rights.
func HasAdminRights(context echo.Context) error {
	ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "admin")
	if err != nil {
		log.L.Errorf("[health] Failed to verify admin role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
		return context.JSON(http.StatusInternalServerError, err.Error())
	}
	if !ok {
		log.L.Warnf("[health] User %s does not have admin rights.", context.Request().Context().Value("user").(string))
		return context.JSON(http.StatusForbidden, alert)
	}

	return context.JSON(http.StatusOK, ok)
}
