package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/labstack/echo"

	"github.com/byuoitav/common/nerr"

	l "github.com/byuoitav/common/log"
	"github.com/byuoitav/common/structs"
)

var changes ChangeLog

// ChangeType is a wrapper for an int that the internet suggested that I use...
type ChangeType int

// Constant values for the type of changes to be checked for.
const (
	Building ChangeType = 1
	Room     ChangeType = 2
	Device   ChangeType = 3
	UIConfig ChangeType = 4
)

// ChangeLog is a total representation of what a user has changed using the tool at the time of submission.
type ChangeLog struct {
	Username        string   `json:"username"`
	Timestamp       string   `json:"timestamp"`
	ChangeCount     int      `json:"change_count"`
	BuildingChanges []Change `json:"buildings_changed,omitempty"`
	RoomChanges     []Change `json:"rooms_changed,omitempty"`
	DeviceChanges   []Change `json:"devices_changed,omitempty"`
	UIConfigChanges []Change `json:"uiconfigs_changed,omitempty"`
}

// Change represents the changes to an individual object that were made.
type Change struct {
	ID      string   `json:"object_id"`
	Changes []string `json:"changes"`
}

// GetChanges retrieves the change log for viewing.
func GetChanges(context echo.Context) error {

	b, err := ioutil.ReadFile("changelog.txt")
	if err != nil {
		l.L.Info(err)
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	return context.Blob(http.StatusOK, "text/plain", b)
}

// ClearChanges removes the current temporary storage of changes from the change log.
func ClearChanges(context echo.Context) error {
	changes.Flush()

	return context.JSON(http.StatusOK, "Changes cleared.")
}

// Write takes a message and appends it to the change log file.
func (cl *ChangeLog) Write() {
	file, err := os.OpenFile("changelog.txt", os.O_APPEND|os.O_CREATE|os.O_RDWR, 0666)
	if err != nil {
		nerr.Translate(err).Add("Couldn't open the change log file for writing.")
	}

	log.SetOutput(io.Writer(file))
	b, _ := json.MarshalIndent(cl, "", "    ")
	log.Printf("%s", b)
	log.SetOutput(io.Writer(os.Stderr))
	file.Close()
}

// Flush removes the temporary storage of changes.
func (cl *ChangeLog) Flush() {
	cl.BuildingChanges = []Change{}
	cl.RoomChanges = []Change{}
	cl.DeviceChanges = []Change{}
	cl.UIConfigChanges = []Change{}
	cl.ChangeCount = 0
}

// AddChange adds a Change to the ChangeLog.
func (cl *ChangeLog) AddChange(username string, changeType ChangeType, change Change) {
	cl.Username = username
	cl.Timestamp = time.Now().Format(time.UnixDate)
	cl.ChangeCount++

	switch changeType {
	case Building:
		cl.BuildingChanges = append(cl.BuildingChanges, change)
	case Room:
		cl.RoomChanges = append(cl.RoomChanges, change)
	case Device:
		cl.DeviceChanges = append(cl.DeviceChanges, change)
	case UIConfig:
		cl.UIConfigChanges = append(cl.UIConfigChanges, change)
	}
}

// AddNew adds a Change to the ChangeLog for the addition of a new object.
func (cl *ChangeLog) AddNew(username string, changeType ChangeType, newID string) {
	cl.Username = username
	cl.Timestamp = time.Now().Format(time.UnixDate)
	cl.ChangeCount++

	var c Change
	c.ID = newID

	switch changeType {
	case Building:
		c.Changes = append(c.Changes, fmt.Sprintf("%s was added to Buildings", newID))
		cl.BuildingChanges = append(cl.BuildingChanges, c)
	case Room:
		c.Changes = append(c.Changes, fmt.Sprintf("%s was added to Rooms", newID))
		cl.RoomChanges = append(cl.RoomChanges, c)
	case Device:
		c.Changes = append(c.Changes, fmt.Sprintf("%s was added to Devices", newID))
		cl.DeviceChanges = append(cl.DeviceChanges, c)
	case UIConfig:
		c.Changes = append(c.Changes, fmt.Sprintf("%s was added to UIConfigs", newID))
		cl.UIConfigChanges = append(cl.UIConfigChanges, c)
	}
}

// GetNewChange adds a Change to the ChangeLog for the addition of a new object.
func (cl *ChangeLog) GetNewChange(username string, changeType ChangeType, newID string) Change {
	cl.Username = username
	cl.Timestamp = time.Now().Format(time.UnixDate)
	cl.ChangeCount++

	var c Change
	c.ID = newID

	switch changeType {
	case Building:
		c.Changes = append(c.Changes, fmt.Sprintf("%s was added to Buildings", newID))
	case Room:
		c.Changes = append(c.Changes, fmt.Sprintf("%s was added to Rooms", newID))
	case Device:
		c.Changes = append(c.Changes, fmt.Sprintf("%s was added to Devices", newID))
	case UIConfig:
		c.Changes = append(c.Changes, fmt.Sprintf("%s was added to UIConfigs", newID))
	}

	return c
}

// AddBulkChanges adds multiple Change objects to the ChangeLog.
func (cl *ChangeLog) AddBulkChanges(username string, changeType ChangeType, changes []Change) {
	cl.Username = username
	cl.Timestamp = time.Now().Format(time.UnixDate)

	switch changeType {
	case Building:
		cl.BuildingChanges = append(cl.BuildingChanges, changes...)
	case Room:
		cl.RoomChanges = append(cl.RoomChanges, changes...)
	case Device:
		cl.DeviceChanges = append(cl.DeviceChanges, changes...)
	case UIConfig:
		cl.UIConfigChanges = append(cl.UIConfigChanges, changes...)
	}

	cl.ChangeCount += len(changes)
}

// FindChanges compares each attribute of the two objects and appends any changes to the Change object that will be returned.
func FindChanges(old interface{}, new interface{}, changeType ChangeType) Change {
	switch changeType {
	case Building:
		return findBuildingChanges(old.(structs.Building), new.(structs.Building))
	case Room:
		return findRoomChanges(old.(structs.Room), new.(structs.Room))
	case Device:
		return findDeviceChanges(old.(structs.Device), new.(structs.Device))
	case UIConfig:
		return findUIConfigChanges(old.(structs.UIConfig), new.(structs.UIConfig))
	default:
		return Change{}
	}
}

func findBuildingChanges(old structs.Building, new structs.Building) Change {
	var toReturn Change

	// Assign the change the ID of the original object.
	if len(old.ID) > 0 {
		toReturn.ID = old.ID
	}

	// Check to see if the ID changed.
	if old.ID != new.ID {
		msg := fmt.Sprintf("ID was changed from %s to %s", old.ID, new.ID)
		toReturn.Changes = append(toReturn.Changes, msg)
	}

	// Check to see if the Name changed.
	if old.Name != new.Name {
		msg := fmt.Sprintf("Name was changed from %s to %s", old.Name, new.Name)
		toReturn.Changes = append(toReturn.Changes, msg)
	}

	// Check to see if the Description changed.
	if old.Description != new.Description {
		msg := fmt.Sprintf("Description was changed from %s to %s", old.Description, new.Description)
		toReturn.Changes = append(toReturn.Changes, msg)
	}

	// Check to see if any Tags were removed.
	for _, t := range old.Tags {
		if !stringListContains(new.Tags, t) {
			msg := fmt.Sprintf("Tag '%s' was removed", t)
			toReturn.Changes = append(toReturn.Changes, msg)
		}
	}

	// Check to see if any Tags were added.
	for _, t := range new.Tags {
		if !stringListContains(old.Tags, t) {
			msg := fmt.Sprintf("Tag '%s' was added", t)
			toReturn.Changes = append(toReturn.Changes, msg)
		}
	}

	return toReturn
}

func findRoomChanges(old structs.Room, new structs.Room) Change {
	var toReturn Change

	// Assign the change the ID of the original object.
	if len(old.ID) > 0 {
		toReturn.ID = old.ID
	}

	// Check to see if the ID changed.
	if old.ID != new.ID {
		msg := fmt.Sprintf("ID was changed from %s to %s", old.ID, new.ID)
		toReturn.Changes = append(toReturn.Changes, msg)
	}

	// Check to see if the Name changed.
	if old.Name != new.Name {
		msg := fmt.Sprintf("Name was changed from %s to %s", old.Name, new.Name)
		toReturn.Changes = append(toReturn.Changes, msg)
	}

	// Check to see if the Description changed.
	if old.Description != new.Description {
		msg := fmt.Sprintf("Description was changed from %s to %s", old.Description, new.Description)
		toReturn.Changes = append(toReturn.Changes, msg)
	}

	// Check to see if the Configuration changed.
	if old.Configuration.ID != new.Configuration.ID {
		msg := fmt.Sprintf("Configuration was changed from %s to %s", old.Configuration.ID, new.Configuration.ID)
		toReturn.Changes = append(toReturn.Changes, msg)
	}

	// Check to see if the Designation changed.
	if old.Designation != new.Designation {
		msg := fmt.Sprintf("Designation was changed from %s to %s", old.Designation, new.Designation)
		toReturn.Changes = append(toReturn.Changes, msg)
	}

	// Check to see if any Tags were removed.
	for _, t := range old.Tags {
		if !stringListContains(new.Tags, t) {
			msg := fmt.Sprintf("Tag '%s' was removed", t)
			toReturn.Changes = append(toReturn.Changes, msg)
		}
	}

	// Check to see if any Tags were added.
	for _, t := range new.Tags {
		if !stringListContains(old.Tags, t) {
			msg := fmt.Sprintf("Tag '%s' was added", t)
			toReturn.Changes = append(toReturn.Changes, msg)
		}
	}

	return toReturn
}

func findDeviceChanges(old structs.Device, new structs.Device) Change {
	var toReturn Change

	// Assign the change the ID of the original object.
	if len(old.ID) > 0 {
		toReturn.ID = old.ID
	}

	// Check to see if the ID changed.
	if old.ID != new.ID {
		msg := fmt.Sprintf("ID was changed from %s to %s", old.ID, new.ID)
		toReturn.Changes = append(toReturn.Changes, msg)
	}

	// Check to see if the Name changed.
	if old.Name != new.Name {
		msg := fmt.Sprintf("Name was changed from %s to %s", old.Name, new.Name)
		toReturn.Changes = append(toReturn.Changes, msg)
	}

	// Check to see if the Description changed.
	if old.Description != new.Description {
		msg := fmt.Sprintf("Description was changed from %s to %s", old.Description, new.Description)
		toReturn.Changes = append(toReturn.Changes, msg)
	}

	// Check to see if the Address changed.
	if old.Address != new.Address {
		msg := fmt.Sprintf("Address was changed from %s to %s", old.Address, new.Address)
		toReturn.Changes = append(toReturn.Changes, msg)
	}

	// Check to see if the DisplayName changed
	if old.DisplayName != new.DisplayName {
		msg := fmt.Sprintf("Display Name was changed from %s to %s", old.DisplayName, new.DisplayName)
		toReturn.Changes = append(toReturn.Changes, msg)
	}

	// Check to see if any Roles were removed.
	for _, r := range old.Roles {
		if !rolesContains(new.Roles, r.ID) {
			msg := fmt.Sprintf("Role '%s' was removed", r.ID)
			toReturn.Changes = append(toReturn.Changes, msg)
		}
	}

	// Check to see if any Roles were added.
	for _, r := range new.Roles {
		if !rolesContains(old.Roles, r.ID) {
			msg := fmt.Sprintf("Role '%s' was added", r.ID)
			toReturn.Changes = append(toReturn.Changes, msg)
		}
	}

	// Check to see if the Type changed.
	if old.Type.ID != new.Type.ID {
		msg := fmt.Sprintf("Type was changed from %s to %s", old.Type.ID, new.Type.ID)
		toReturn.Changes = append(toReturn.Changes, msg)
	}

	// Check to see if any of the Port configurations were changed, along with friendly names.
	for _, oldPort := range old.Ports {
		for _, newPort := range new.Ports {
			if oldPort.ID == newPort.ID {
				if oldPort.FriendlyName != newPort.FriendlyName {
					msg := fmt.Sprintf("Friendly Name on port '%s' was changed from %s to %s", oldPort.ID, oldPort.FriendlyName, newPort.FriendlyName)
					toReturn.Changes = append(toReturn.Changes, msg)
				}

				if oldPort.SourceDevice != newPort.SourceDevice {
					msg := fmt.Sprintf("Source Device on port '%s' was changed from %s to %s", oldPort.ID, oldPort.SourceDevice, newPort.SourceDevice)
					toReturn.Changes = append(toReturn.Changes, msg)
				}

				if oldPort.DestinationDevice != newPort.DestinationDevice {
					msg := fmt.Sprintf("Destination Device on port '%s' was changed from %s to %s", oldPort.ID, oldPort.DestinationDevice, newPort.DestinationDevice)
					toReturn.Changes = append(toReturn.Changes, msg)
				}
			}
		}
	}

	// Check to see if any Tags were removed.
	for _, t := range old.Tags {
		if !stringListContains(new.Tags, t) {
			msg := fmt.Sprintf("Tag '%s' was removed", t)
			toReturn.Changes = append(toReturn.Changes, msg)
		}
	}

	// Check to see if any Tags were added.
	for _, t := range new.Tags {
		if !stringListContains(old.Tags, t) {
			msg := fmt.Sprintf("Tag '%s' was added", t)
			toReturn.Changes = append(toReturn.Changes, msg)
		}
	}

	return toReturn
}

func findUIConfigChanges(old structs.UIConfig, new structs.UIConfig) Change {
	var toReturn Change

	// Assign the change the ID of the original object.
	if len(old.ID) > 0 {
		toReturn.ID = old.ID
	}

	// Check to see if the ID changed.
	if old.ID != new.ID {
		msg := fmt.Sprintf("ID was changed from %s to %s", old.ID, new.ID)
		toReturn.Changes = append(toReturn.Changes, msg)
	}

	// Check to see if any API sources were removed.
	for _, a := range old.Api {
		if !stringListContains(new.Api, a) {
			msg := fmt.Sprintf("API source '%s' was removed", a)
			toReturn.Changes = append(toReturn.Changes, msg)
		}
	}

	// Check to see if any API sources were added.
	for _, a := range new.Api {
		if !stringListContains(old.Api, a) {
			msg := fmt.Sprintf("API source '%s' was added", a)
			toReturn.Changes = append(toReturn.Changes, msg)
		}
	}

	// Check for changes in the Panels.
	for i, oldPanel := range old.Panels {
		newPanel := new.Panels[i]

		// Check to see if the Hostname changed.
		if oldPanel.Hostname != newPanel.Hostname {
			msg := fmt.Sprintf("Panel with Hostname '%s' was changed to Hostname '%s'", oldPanel.Hostname, newPanel.Hostname)
			toReturn.Changes = append(toReturn.Changes, msg)
		}

		// Check to see if the Preset changed.
		if oldPanel.Preset != newPanel.Preset {
			msg := fmt.Sprintf("Preset on Panel %s was changed from '%s' to '%s'", oldPanel.Hostname, oldPanel.Preset, newPanel.Preset)
			toReturn.Changes = append(toReturn.Changes, msg)
		}

		// Check to see if the UIPath changed.
		if oldPanel.UIPath != newPanel.UIPath {
			msg := fmt.Sprintf("UIPath on Panel %s was changed from '%s' to '%s'", oldPanel.Hostname, oldPanel.UIPath, newPanel.UIPath)
			toReturn.Changes = append(toReturn.Changes, msg)
		}

		// Check to see if any Features were removed.
		for _, f := range oldPanel.Features {
			if !stringListContains(newPanel.Features, f) {
				msg := fmt.Sprintf("Feature '%s' was removed from Panel %s", f, oldPanel.Hostname)
				toReturn.Changes = append(toReturn.Changes, msg)
			}
		}

		// Check to see if any Features were added.
		for _, f := range newPanel.Features {
			if !stringListContains(oldPanel.Features, f) {
				msg := fmt.Sprintf("Feature '%s' was added to Panel %s", f, oldPanel.Hostname)
				toReturn.Changes = append(toReturn.Changes, msg)
			}
		}
	}

	// Check for changes in the Presets.
	for _, oldPreset := range old.Presets {
		newPreset, found := presetsContains(new.Presets, oldPreset.Name)
		if !found {
			msg := fmt.Sprintf("Preset %s was removed", oldPreset.Name)
			toReturn.Changes = append(toReturn.Changes, msg)
		} else {
			// Check to see if the icon was changed.
			if oldPreset.Icon != newPreset.Icon {
				msg := fmt.Sprintf("The Icon for Preset %s was changed from '%s' to '%s'", oldPreset.Name, oldPreset.Icon, newPreset.Icon)
				toReturn.Changes = append(toReturn.Changes, msg)
			}

			// Check to see if any displays were removed.
			for _, d := range oldPreset.Displays {
				if !stringListContains(newPreset.Displays, d) {
					msg := fmt.Sprintf("%s was removed from Displays on Preset %s", d, oldPreset.Name)
					toReturn.Changes = append(toReturn.Changes, msg)
				}
			}

			// Check to see if any displays were added.
			for _, d := range newPreset.Displays {
				if !stringListContains(oldPreset.Displays, d) {
					msg := fmt.Sprintf("%s was added to Displays on Preset %s", d, oldPreset.Name)
					toReturn.Changes = append(toReturn.Changes, msg)
				}
			}

			// Check to see if any shareable displays were removed.
			for _, d := range oldPreset.ShareableDisplays {
				if !stringListContains(newPreset.ShareableDisplays, d) {
					msg := fmt.Sprintf("%s was removed from ShareableDisplays on Preset %s", d, oldPreset.Name)
					toReturn.Changes = append(toReturn.Changes, msg)
				}
			}

			// Check to see if any shareable displays were added.
			for _, d := range newPreset.ShareableDisplays {
				if !stringListContains(oldPreset.ShareableDisplays, d) {
					msg := fmt.Sprintf("%s was added to ShareableDisplays on Preset %s", d, oldPreset.Name)
					toReturn.Changes = append(toReturn.Changes, msg)
				}
			}

			// Check to see if any audio devices were removed.
			for _, a := range oldPreset.AudioDevices {
				if !stringListContains(newPreset.AudioDevices, a) {
					msg := fmt.Sprintf("%s was removed from AudioDevices on Preset %s", a, oldPreset.Name)
					toReturn.Changes = append(toReturn.Changes, msg)
				}
			}

			// Check to see if any audio devices were added.
			for _, a := range newPreset.AudioDevices {
				if !stringListContains(oldPreset.AudioDevices, a) {
					msg := fmt.Sprintf("%s was added to AudioDevices on Preset %s", a, oldPreset.Name)
					toReturn.Changes = append(toReturn.Changes, msg)
				}
			}

			// Check to see if any independent audio devices were removed.
			for _, a := range oldPreset.IndependentAudioDevices {
				if !stringListContains(newPreset.IndependentAudioDevices, a) {
					msg := fmt.Sprintf("%s was removed from IndependentAudioDevices on Preset %s", a, oldPreset.Name)
					toReturn.Changes = append(toReturn.Changes, msg)
				}
			}

			// Check to see if any independent audio devices were added.
			for _, a := range newPreset.IndependentAudioDevices {
				if !stringListContains(oldPreset.IndependentAudioDevices, a) {
					msg := fmt.Sprintf("%s was added to IndependentAudioDevices on Preset %s", a, oldPreset.Name)
					toReturn.Changes = append(toReturn.Changes, msg)
				}
			}

			// Check to see if any inputs were removed.
			for _, i := range oldPreset.Inputs {
				if !stringListContains(newPreset.Inputs, i) {
					msg := fmt.Sprintf("%s was removed from Inputs on Preset %s", i, oldPreset.Name)
					toReturn.Changes = append(toReturn.Changes, msg)
				}
			}

			// Check to see if any inputs were added.
			for _, i := range newPreset.Inputs {
				if !stringListContains(oldPreset.Inputs, i) {
					msg := fmt.Sprintf("%s was added to Inputs on Preset %s", i, oldPreset.Name)
					toReturn.Changes = append(toReturn.Changes, msg)
				}
			}
		}
	}

	// Check for changes to any of the Input Configurations.
	for _, oldIO := range old.InputConfiguration {
		newIO, found := ioContains(new.InputConfiguration, oldIO.Name)
		if !found {
			msg := fmt.Sprintf("Input %s was removed", oldIO.Name)
			toReturn.Changes = append(toReturn.Changes, msg)
		} else {
			if oldIO.Icon != newIO.Icon {
				msg := fmt.Sprintf("Input %s's icon was changed from '%s' to '%s'", oldIO.Name, oldIO.Icon, newIO.Icon)
				toReturn.Changes = append(toReturn.Changes, msg)
			}
		}
	}

	// Check for additions to the InputConfiguration.
	for _, newIO := range new.InputConfiguration {
		_, found := ioContains(old.InputConfiguration, newIO.Name)
		if !found {
			msg := fmt.Sprintf("Input %s was added", newIO.Name)
			toReturn.Changes = append(toReturn.Changes, msg)
		}
	}

	// Check for changes to any of the Output Configurations.
	for _, oldIO := range old.OutputConfiguration {
		newIO, found := ioContains(new.OutputConfiguration, oldIO.Name)
		if !found {
			msg := fmt.Sprintf("Output %s was removed", oldIO.Name)
			toReturn.Changes = append(toReturn.Changes, msg)
		} else {
			if oldIO.Icon != newIO.Icon {
				msg := fmt.Sprintf("Output %s's icon was changed from '%s' to '%s'", oldIO.Name, oldIO.Icon, newIO.Icon)
				toReturn.Changes = append(toReturn.Changes, msg)
			}
		}
	}

	// Check for additions to the OutputConfiguration.
	for _, newIO := range new.OutputConfiguration {
		_, found := ioContains(old.OutputConfiguration, newIO.Name)
		if !found {
			msg := fmt.Sprintf("Output %s was added", newIO.Name)
			toReturn.Changes = append(toReturn.Changes, msg)
		}
	}

	return toReturn
}

func stringListContains(stringList []string, toCheck string) bool {
	for _, s := range stringList {
		if s == toCheck {
			return true
		}
	}
	return false
}

func rolesContains(roles []structs.Role, idToCheck string) bool {
	for _, r := range roles {
		if r.ID == idToCheck {
			return true
		}
	}
	return false
}

func presetsContains(presets []structs.Preset, nameToCheck string) (structs.Preset, bool) {
	for _, p := range presets {
		if p.Name == nameToCheck {
			return p, true
		}
	}
	return structs.Preset{}, false
}

func ioContains(ioList []structs.IOConfiguration, nameToCheck string) (structs.IOConfiguration, bool) {
	for _, io := range ioList {
		if io.Name == nameToCheck {
			return io, true
		}
	}
	return structs.IOConfiguration{}, false
}
