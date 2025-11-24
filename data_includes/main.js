//// Script to implement the LexTALE test (Lemhöfer & Broersma, 2012) in Ibex using PennController ////
/// Author of original text-based English LexTale PCIbex script: Mieke Slim
/// Author of image-based PCIbex script for Mandarin characters and pseudo-characters: Lisa Levinson
/// Mandarin materials from:
/// Chan, I. L., & Chang, C. B. (2018). LEXTALE_CH: A Quick, Character-Based Proficiency Test for Mandarin Chinese. 
/// Proceedings of the Annual Boston University Conference on Language Development, 42, 114--130. https://doi.org/10.17605/OSF.IO/R3VS9
/// retrieved from https://osf.io/r3vs9/

PennController.ResetPrefix(null);
//// Use this command before publishing:
// PennController.DebugOff() 
PennController.Sequence("LexTale_instructions", "LexTale_trials", "closing")

//// Implement the LexTale test
/// Instructions:

// Subject info
   PennController("LexTale_instructions",
    defaultText
    ,
    newText("LexTale_InstructionText", "您好，这是一个汉字测试。在下一页，您将会看到90个看上去像“汉字”的字，当中只有一些是真正存在的汉字。您需要对每一个字做出判断，如果您认为该字是在中文里存在的（即使您不能够明确地说出该字的意思）或者是您知道该字的话，请点击“是汉字”，如果您认为该字在中文里是不存在的，请点击“不是汉字”。您无需快速回答每一道问题，但请您根据您的第一反应来作答，不用过度的犹豫。请在没有任何外来帮忙的情况下独立完成此测试（不要使用任何汉语词典！）。所有的字皆为简体中文。") 
    ,
    newCanvas("myCanvas", 600, 600)
            .settings.add(0,0, getText("LexTale_InstructionText"))
            .print()
    ,              
    newTextInput("Subject", randomnumber = Math.floor(Math.random()*1000000))             
    ,
    newButton("Start")
        .print()
        .wait()
    ,
    newVar("Subject")
        .settings.global()
        .set( getTextInput("Subject") )
    )
    .log( "Subject" , getVar("Subject") )
   

/// Trials
    PennController.Template(
        PennController.GetTable( "stimuli.csv")
        ,
        trial => PennController("LexTale_trials",
            newImage("stimulus", trial.Stimulus)
                .size(50, 50)
                .center()
                .print()
            ,
//            newText("stimulus", trial.Stimulus)
//               .settings.css("font-size", "60px")
//                .settings.css("font-family", "avenir")
//                .settings.bold()
//                .settings.center()
//                .print()
//              ,
            newText("no", "不是汉字")
                .settings.css("font-size", "40px")
                .settings.css("font-family", "avenir")
                .settings.color("red")
                .settings.bold()
            ,
            newText("yes", "是汉字")
                .settings.css("font-size", "40px")
                .settings.css("font-family", "avenir")
                .settings.color("green")
                .settings.bold()

            ,
            newCanvas(800, 600)
                .settings.add( 0,     100,      getText("no"))
                .settings.add( 500,     100,    getText("yes"))
                .print()
            ,
            newSelector()
                .settings.add(getText("no") , getText("yes") )
                .settings.log()
                .wait()
        )
    .log( "Stimulus"    , trial.Stimulus    )
    .log( "Type"        , trial.Type        )
    .log( "Block"       , trial.Block       )
    .log( "Subject"         , getVar("Subject")         ) 
    )
 
// Send results to server
//PennController.SendResults();

/// Closing text
    PennController("closing",
        defaultText
            .print()
        ,
        newText("<p>Thank you for participating!</p>")
    )
    
