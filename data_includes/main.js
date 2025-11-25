//// Script to implement the LexTALE test (Lemhöfer & Broersma, 2012) in Ibex using PennController ////
/// Author of original text-based English LexTale PCIbex script: Mieke Slim
/// Author of image-based PCIbex script for Mandarin characters and pseudo-characters: Lisa Levinson
/// Author of the PCIbex script for LexCHI: Lucy Chiang
/// Mandarin materials adatped from:
/// Wen, Y., Qiu, Y., Leong, C.X.R. et al. LexCHI: A quick lexical test for estimating language proficiency in Chinese. 
/// Behav Res 56, 2333–2352 (2024). https://doi.org/10.3758/s13428-023-02151-z 


PennController.ResetPrefix(null);

PennController.DebugOff();

// Sequence: calibration first, then instructions, trials, closing
Sequence("calibration", "preloadExperiment", "LexTale_instructions", "LexTale_trials", SendResults(), "closing");
CheckPreloaded( startsWith("LexTale_trials") )
    .label( "preloadExperiment" )

///// CALIBRATION TRIAL (measures audio latency)
PennController("calibration",
    newText("calibInfo",
        "我們正在校正您的電腦撥放音檔的延遲速度。請您戴上耳機。按下「開始校正」後，您會聽到一個提示音，播放完畢之後＂繼續＂鍵會出現。請您點選＂繼續＂開始接下來的測驗。"
    ).print(),

    newButton("StartCalibration", "開始校正")
        .print()
        .center()
        .wait(),

    // Vars to hold timestamps/latency
    newVar("playRequestTime").settings.global().set(0),
    newVar("audioStartTime").settings.global().set(0),
    newVar("AudioLatency").settings.global().set(0),
               
    // record the time when we request playback (before calling .play())
    getVar("playRequestTime").set(v => Date.now()),

    // Play a short beep; callback sets actual audio start time
     newAudio("calib", "calibration_beep.wav")
        .play(),

     // True audio start time
    getVar("audioStartTime").set(v => Date.now()),

    // Compute latency
    getVar("AudioLatency").set(
        v => getVar("audioStartTime").value - getVar("playRequestTime").value
    ),

    newButton("Continue", "繼續")
        .print()
        .center()
        .wait()
)
.log("AudioLatency", getVar("AudioLatency"));

///// INSTRUCTIONS
PennController("LexTale_instructions",
    newText("LexTale_InstructionText",
        "您好：這是一個漢字測驗，這個部分的測驗一共有60题。每一題中，你將會看到並且聽到兩個漢字的組合。在這些組合當中，有一些是中文語詞，例如：＂科學＂。您需要對每一個組合做出判斷，如果你認為該組合在中文裡是存在的（即使您不能明確地說出該語詞的意思）或是您知道該語詞的話，請點擊＂是中文語詞＂，如果您認為該語詞在中文裡是不存在的，請點擊＂不是中文語詞＂。這個測驗並沒有計時，請您根據您的第一反應盡速作答，您不用過度的猶豫，並且請您在沒有使用任何中文辭典或是字典的幫忙下獨力完成此測驗。所有的詞語皆為繁體中文，發音為台灣華語。"
    ),

    newCanvas("instructionCanvas", 600, 600)
        .settings.add(0, 0, getText("LexTale_InstructionText"))
        .print(),

    newText("IDlabel", "Subject ID:")
        .print(),

    // Remove .log() — TextInput cannot log
    newTextInput("Subject")
        .print(),

    newButton("Start", "開始測驗")
        .print()
        .wait(),

    // Store globally (this part stays correct)
    newVar("Subject").settings.global()
        .set( getTextInput("Subject") )
)
.log("Subject", getVar("Subject"));

   

///// MAIN TRIAL TEMPLATE
Template("stimuli.csv", row =>
    newTrial("LexTale_trials",
        // Initialize timing and subject vars
        newVar("audioStart").global().set(0),
        newVar("playRequestTime").global().set(0),
        newVar("RT_yes").global().set("NA"),
        newVar("RT_no").global().set("NA"),
        newVar("AudioLatency").global().set("NA"),  // Initialize for logging
        newVar("Subject").global().set("NA"),       // Set this somewhere earlier

        
        // Show stimulus (could move before audio if you want)
        newText("stimulus", row.Stimulus)
             .css("font-size", "60px")
             .css("font-family", "Avenir")
             .bold()
             .center()
             .print(),
    
      // play the trial audio
        newAudio("audio", row.AudioFile)
            .play(),

        // Choice labels
        newText("no", "不是中文語詞")
            .css("font-size", "40px")
            .css("font-family", "Avenir")
            .color("red")
            .bold(),

        newText("yes", "是中文語詞")
            .css("font-size", "40px")
            .css("font-family", "Avenir")
            .color("green")
            .bold(),

        // Record play request time
        getVar("playRequestTime").set(v => Date.now()),

        // Layout choices
        newCanvas("choiceCanvas", 800, 600)
            .add(0, 100, getText("no"))
            .add(500, 100, getText("yes"))
            .print(),

        // Selector: wait for response. On response, compute RT relative to actual audio start.
        newSelector("choice")
            .add(getText("no"), getText("yes"))
            .log()
            .wait(),
        getSelector("choice").test.selected(getText("yes"))
            .success(
                getVar("RT_yes").set(v => Date.now() - getVar("audioStart").value),
                getVar("RT_no").set("NA")
            )
            .failure(
                getVar("RT_no").set(v => Date.now() - getVar("audioStart").value),
                getVar("RT_yes").set("NA")
            ),


        // Wait for audio to start
        getAudio("audio").wait("first"),

        // Set actual audio start timestamp
        getVar("audioStart").set(v => Date.now()),
        // Log RT and latency
        getVar("RT_yes").log(),
        getVar("RT_no").log(),
        getVar("AudioLatency").log()  // If you set this somewhere else
    )
    // Trial-level logging
    .log("Stimulus", row.Stimulus)
    .log("Type", row.Type)
    .log("Block", row.Block)
    .log("Subject", getVar("Subject"))
    .log("RT_yes", getVar("RT_yes"))
    .log("RT_no", getVar("RT_no"))
    .log("AudioLatency", getVar("AudioLatency"))
);

///// CLOSING
PennController("closing",
    newText("thanks", "<p>Thank you for participating!</p>")
        .print(),
    newButton("Finish", "結束")
        .print()
        .wait()
);

// Uncomment to send results automatically:
// PennController.SendResults();
