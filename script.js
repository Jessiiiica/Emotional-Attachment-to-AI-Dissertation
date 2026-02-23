//function to show the banner only for 5 seconds once it is told to appear in either timed interaction or needing to click the form link
function showOnly5Seconds(el) {
    //if the given banner doesnt exist then don't try anything as this would cause a crash
    if (!el) {
        return;
    }
    else {
        el.classList.remove("hidden");
        el.classList.add("show");

        setTimeout(() => {
            el.classList.remove("show")
            setTimeout(() => el.classList.add("hidden"), 600);
        }, 5000);
    }
}

/*Chatbot interaction timer so each user only spends exactly 10mins talking to each chatbot*/
window.addEventListener("DOMContentLoaded", () => {
    //Added in a data variable so only two of our pages (chabotA and chatbotB) will have this, this is added in the <body> in html
    if (document.body.dataset.tenMinsA || document.body.dataset.tenMinsB) {

        const banner9mins = document.getElementById("banner9mins");
        const banner10secs = document.getElementById("banner10secs");
        let shown9mins = false;
        let shown10sec = false;

        //start our timer on page load
        const start = Date.now();

        //check if either of the banners are needed (based on time via ticks) and if they are show them
        const tick = () => {
            const timeGone = Date.now() - start;
            const timeLeft = 600000 - timeGone;

            //when one min left (60,000) and it hasnt been shown before, show the banner
            if (!shown9mins && timeLeft <= 60000) {
                shown9mins = true;
                showOnly5Seconds(banner9mins);
            }

            //when 10 seconds left (10,000) and it hasnt been shown before, show the banner
            if (!shown10sec && timeLeft <= 10000) {
                shown10sec = true;
                showOnly5Seconds(banner10secs);
            }

            //if 10mins have passed then redirect the user to the next page
            if (timeLeft <= 0) {
                if (document.body.dataset.tenMinsA) {
                    fetch("http://localhost:3000/api/save-chat", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sessionId: sessionId })
                    }).finally(() => {
                        //need finally or doesnt finish saving everytime / fully
                        window.location.assign("chatbotAForm.html");
                    });
                } else if (document.body.dataset.tenMinsB) {
                    fetch("http://localhost:3000/api/save-chat", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sessionId: sessionId })
                    }).finally(() => {
                        window.location.assign("chatbotBForm.html");
                    })
                }
                return;
            }
            requestAnimationFrame(tick);
        };
        tick();
    }
    /*Form screen link checker to ensure the user answers the form before being able to move on*/
    if (document.body.dataset.requiredFormLink) {
        const requiredLink = document.getElementById("requiredLink");
        const continueButton = document.getElementById("continueButton");

        const key = `requiredLinkClicked:${window.location.pathname}`;
    
        //Debugging: Keep unlocked if it's been unlocked by opening the form even when refreshing the page
        const alreadyOpenedForm = sessionStorage.getItem(key) === "true";

        continueButton.setAttribute("aria-disabled", String(!alreadyOpenedForm));
        continueButton.classList.toggle("is-disabled", !alreadyOpenedForm);
    
        //Check for the link being clicked - once clicked then allow the button to work again
        if (requiredLink) {
            requiredLink.addEventListener("click", () => {
                sessionStorage.setItem(key, "true");
                continueButton.setAttribute("aria-disabled", "false");
            });
        }
    }
});

//Handles the needed page switch when the button is no longer blocked
window.switchPage = function (nextPage) {
    const continueButton = document.getElementById("continueButton");
    const infoBanner = document.getElementById("openLinkBanner");

    if (continueButton.getAttribute("aria-disabled") === "true") {
        showOnly5Seconds(infoBanner);
        return false;
    }

    window.location.assign(nextPage);
    return false;
}

/*Calling through to the backend to allow communication with the chatbot*/
const chatInput = document.getElementById("chatInput");
const chatOutput = document.getElementById("chatOutput");
const sendChat = document.getElementById("sendChat");

let sessionId = Date.now() + "_" + Math.random().toString(16).slice(2);

const chatBot = document.body.dataset.chatbot;

sendChat.addEventListener("click", async () => {
    const message = chatInput.value.trim();
    if (!message) return;

    chatOutput.textContent += "You: " + message + "\n";
    chatInput.value = "";

    try {
        const res = await fetch("http://localhost:3000/api/conversation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: message,
                chatBot: chatBot,
                sessionId: sessionId
            })
        });

        const data = await res.json();

        chatOutput.textContent += "Chatbot: " + data.reply + "\n\n";
    } catch (err) {
        chatOutput.textContent += "Error talking to chatbot\n\n";
        console.error(err);
    }
});

