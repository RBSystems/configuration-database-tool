package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/byuoitav/common/log"
	"github.com/labstack/echo"
)

// Status returns the health status of the application.
func Status(context echo.Context) error {
	SS.StartTime = Start.Format(time.UnixDate)

	SS.Uptime = time.Since(Start).Round(time.Second).String()

	SS.Message = fmt.Sprintf("Today's the day! The sun is shining, the tank is clean, and we are getting out of... *gasp* the tank is clean. THE TANK IS CLEAN!!")

	b, err := json.MarshalIndent(SS, "", "    ")
	if err != nil {
		log.L.Warnf("[health] Failed to marshal the ServerStatus : %v", err.Error())
	} else {
		log.L.Info(string(b))
	}

	return context.JSONPretty(http.StatusOK, SS, "    ")
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
