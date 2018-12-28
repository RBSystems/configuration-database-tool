package helpers

// A list of actions to be used in reporting
const (
	AddAction    = "add"
	UpdateAction = "update"
	DeleteAction = "delete"
)

// A list of tags for logging
const (
	BuildingsTag = "[buildings]"
	RoomsTag     = "[rooms]"
	DevicesTag   = "[devices]"
	UIConfigsTag = "[uiconfigs]"
	OptionsTag   = "[options]"
	AlertsTag    = "[alerts]"
	MetricsTag   = "[metrics]"
)

// DBResponse contains the information to be reported back upon changes being made to the database
type DBResponse struct {
	ObjectID string `json:"object_id"`
	Action   string `json:"action"`
	Success  bool   `json:"success"`
	Message  string `json:"message,omitempty"`
	Error    string `json:"error,omitempty"`
}

// MetricsResponse contains the information to be reported back when asked for metrics data
type MetricsResponse struct {
	ObjectID  string         `json:"object_id"`
	Action    string         `json:"action"`
	Username  string         `json:"username"`
	Timestamp string         `json:"timestamp"`
	Changes   []ChangeRecord `json:"changes,omitempty"`
}

// ChangeRecord contains the information about what was changed about the object when it was updated
type ChangeRecord struct {
	AttributeName string `json:"attribute_name"`
	OldValue      string `json:"old_value"`
	NewValue      string `json:"new_value"`
}
