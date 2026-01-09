/*Chatbot interaction timer so each user only spends exactly 10mins talking to each chatbot*/
window.addEventListener("DOMContentLoaded", () => {
    //Added in a data variable so only two of our pages (chabotA and chatbotB) will have this, this is added in the <body> in html
    if (!document.body.dataset.tenMinsA && !document.body.dataset.tenMinsB) return;
    const banner9mins = document.getElementById("banner9mins");
    const banner10secs = document.getElementById("banner10secs");
    let shown9mins = false;
    let shown10sec = false;

    //start our timer on page load
    const start = Date.now();

    //function to show the banner only for 5 seconds once it is told to appear
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
                window.location.assign("chatbotAForm.html");               
            } else if (document.body.dataset.tenMinsB) {
                window.location.assign("chatbotBForm.html");
            }
            return;
        }
        requestAnimationFrame(tick);
        }; 
    tick();
});