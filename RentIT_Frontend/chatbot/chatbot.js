/* =====================================================
   RENTAI CHATBOT
   Connected to RentIT Backend
   ===================================================== */

(function () {

    // Prevent duplicate chatbot
    if (document.getElementById("rentai-button")) {
        return;
    }


    /* -------------------------------------------------
       CHAT BUTTON
       ------------------------------------------------- */

    const button = document.createElement("button");

    button.id = "rentai-button";
    button.innerHTML = "🤖";
    button.title = "Chat with RentAI";


    /* -------------------------------------------------
       CHAT WINDOW
       ------------------------------------------------- */

    const chatWindow = document.createElement("div");

    chatWindow.id = "rentai-window";

    chatWindow.innerHTML = `

        <div class="rentai-header">

            <div class="rentai-header-left">

                <div class="rentai-avatar">
                    🤖
                </div>

                <div>

                    <div class="rentai-title">
                        RentAI
                    </div>

                    <div class="rentai-status">
                        AI Assistant • Online
                    </div>

                </div>

            </div>

            <button id="rentai-close">
                ×
            </button>

        </div>


        <div id="rentai-messages">

            <div class="rentai-message bot">

                <div class="rentai-bubble">

                    Hello! 👋<br><br>

                    I'm <strong>RentAI</strong>,
                    your RentIT AI assistant.

                    <br><br>

                    I can help you find rental products
                    and answer questions about RentIT.

                </div>

            </div>

        </div>


        <div class="rentai-input-area">

            <input
                type="text"
                id="rentai-input"
                placeholder="Ask RentAI..."
                autocomplete="off"
            >

            <button id="rentai-send">
                ➤
            </button>

        </div>

    `;


    /* -------------------------------------------------
       ADD CHATBOT TO PAGE
       ------------------------------------------------- */

    document.body.appendChild(button);
    document.body.appendChild(chatWindow);


    /* -------------------------------------------------
       ELEMENTS
       ------------------------------------------------- */

    const closeButton =
        document.getElementById("rentai-close");

    const input =
        document.getElementById("rentai-input");

    const sendButton =
        document.getElementById("rentai-send");

    const messages =
        document.getElementById("rentai-messages");


    /* -------------------------------------------------
       OPEN CHAT
       ------------------------------------------------- */

    button.addEventListener("click", function () {

        const isOpen =
            chatWindow.style.display === "flex";

        if (isOpen) {

            chatWindow.style.display = "none";

        } else {

            chatWindow.style.display = "flex";

            setTimeout(function () {
                input.focus();
            }, 100);

        }

    });


    /* -------------------------------------------------
       CLOSE CHAT
       ------------------------------------------------- */

    closeButton.addEventListener("click", function () {

        chatWindow.style.display = "none";

    });


    /* -------------------------------------------------
       ADD MESSAGE
       ------------------------------------------------- */

    function addMessage(text, sender) {

        const message =
            document.createElement("div");

        message.className =
            "rentai-message " + sender;


        const bubble =
            document.createElement("div");

        bubble.className =
            "rentai-bubble";


        // Convert new lines to <br>
        bubble.innerHTML =
            text.replace(/\n/g, "<br>");


        message.appendChild(bubble);

        messages.appendChild(message);


        // Scroll to latest message
        messages.scrollTop =
            messages.scrollHeight;

    }


    /* -------------------------------------------------
       ADD PRODUCT CARDS
       ------------------------------------------------- */

    function addProductCards(products) {

        if (!products || products.length === 0) {
            return;
        }


        products.forEach(function (product) {

            const productCard =
                document.createElement("div");

            productCard.className =
                "chat-product-card";


            productCard.innerHTML = `

                <div class="chat-product-name">

                    ${product.name || "Unnamed Product"}

                </div>


                <div class="chat-product-category">

                    ${product.category || "Other"}

                </div>


                <div class="chat-product-price">

                    ₹${product.price ?? 0}

                </div>


                <button
                    class="chat-view-product"
                    data-product-id="${product.product_id}"
                >

                    View Product

                </button>

            `;


            /* -----------------------------------------
               VIEW PRODUCT BUTTON
            ----------------------------------------- */

            const viewButton =
                productCard.querySelector(
                    ".chat-view-product"
                );


            viewButton.addEventListener(
                "click",
                function () {

                    const productId =
                        this.dataset.productId;


                    console.log(
                        "Opening product:",
                        productId
                    );


                    /*
                     * IMPORTANT:
                     *
                     * product_details.html is in the
                     * same folder as index.html.
                     *
                     * Therefore we use:
                     *
                     * product_details.html?id=...
                     *
                     * NOT:
                     *
                     * ../product_details.html
                     */

                    window.location.href =
                        `product_details.html?id=${productId}`;

                }
            );


            messages.appendChild(productCard);

        });


        messages.scrollTop =
            messages.scrollHeight;

    }


    /* -------------------------------------------------
       TYPING INDICATOR
       ------------------------------------------------- */

    function showTyping() {

        const typing =
            document.createElement("div");

        typing.className =
            "rentai-message bot";

        typing.id =
            "rentai-typing";


        typing.innerHTML = `

            <div class="rentai-bubble">

                <div class="rentai-typing">

                    <span></span>
                    <span></span>
                    <span></span>

                </div>

            </div>

        `;


        messages.appendChild(typing);

        messages.scrollTop =
            messages.scrollHeight;

    }


    /* -------------------------------------------------
       REMOVE TYPING INDICATOR
       ------------------------------------------------- */

    function removeTyping() {

        const typing =
            document.getElementById("rentai-typing");


        if (typing) {
            typing.remove();
        }

    }


    /* -------------------------------------------------
       SEND MESSAGE TO BACKEND
       ------------------------------------------------- */

    async function sendMessage() {

        const message =
            input.value.trim();


        // Don't send empty messages
        if (!message) {
            return;
        }


        // Display user message
        addMessage(
            message,
            "user"
        );


        // Clear input
        input.value = "";


        // Disable send button
        sendButton.disabled = true;


        // Show typing
        showTyping();


        try {

            const response =
                await fetch(
                    "http://localhost:3000/api/chat",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            message: message
                        })

                    }
                );


            const data =
                await response.json();


            // Remove typing
            removeTyping();


            /* -----------------------------------------
               CHECK API RESPONSE
            ----------------------------------------- */

            if (
                !response.ok ||
                !data.success
            ) {

                addMessage(
                    "Sorry, I'm having trouble connecting to RentAI right now. Please try again.",
                    "bot"
                );


                console.error(
                    "RentAI API error:",
                    data
                );


                return;

            }


            /* -----------------------------------------
               DISPLAY AI RESPONSE
            ----------------------------------------- */

            addMessage(
                data.reply,
                "bot"
            );


            /* -----------------------------------------
               DISPLAY PRODUCTS
            ----------------------------------------- */

            if (
                data.products &&
                data.products.length > 0
            ) {

                addProductCards(
                    data.products
                );

            }

        } catch (error) {

            console.error(
                "RentAI connection error:",
                error
            );


            removeTyping();


            addMessage(
                "Sorry, I couldn't connect to the RentIT AI server. Please make sure the RentIT backend is running.",
                "bot"
            );

        } finally {

            // Enable send button
            sendButton.disabled = false;

            input.focus();

        }

    }


    /* -------------------------------------------------
       SEND BUTTON
       ------------------------------------------------- */

    sendButton.addEventListener(
        "click",
        sendMessage
    );


    /* -------------------------------------------------
       ENTER KEY
       ------------------------------------------------- */

    input.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                sendMessage();

            }

        }
    );


})();