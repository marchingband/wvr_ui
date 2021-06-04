
export const WVR_IP = "192.168.5.18"

// view constants
export const WAV_ITEM_SIZE = 100


//////////////////
// note configs //
//////////////////

// play_back_mode
export const ONE_SHOT     = 0
export const LOOP         = 1
export const PING_PONG    = 2

// retrigger_mode
export const RETRIGGER    = 0
export const RESTART      = 1
export const NONE         = 2
export const NOTE_OFF     = 3

// note_off_meaning
export const HALT         = 0
export const IGNORE       = 1

// response curve
export const LINEAR         = 0
export const ROOT_SQUARE    = 1
export const FIXED          = 2


/////////////////
// pin configs //
/////////////////

// action
export const NOTE_ON      = 0
export const BANK_UP      = 1
export const BANK_DOWN    = 2
export const WRV_WIFI_ON  = 3
export const WRV_WIFI_OFF = 4
export const TOGGLE_WIFI  = 5
export const VOLUME_UP    = 6
export const VOLUME_DOWN  = 7
export const MUTE_ON      = 8
export const MUTE_OFF     = 9
export const TOGGLE_MUTE  = 10
export const SOFT         = 11

// edge
export const EDGE_NONE         = 0
export const EDGE_FALLING      = 1
export const EDGE_RISING       = 2

///////////////
// pin names //
///////////////

export const pinNames = [
    'D0','D1','D2','D3','D4','D5',
    'D6 A0* T3','D7 A1*','D8 A2*','D9 A3*',
    'D10 A4*','D11 A5 T0','D12 A6 T1','D13 A7 T2'
]


// default config enums
export const PRIORITIES = Array(10).fill().map((_,i)=>i)
export const NOTES      = Array(128).fill().map((_,i)=>i)
export const VELOCITIES = Array(128).fill().map((_,i)=>i)
export const NUM_LAYERS = Array(31).fill().map((_,i)=>i+2)
