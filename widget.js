class DiscWidget {
  static apiKey = null; // Store the API key

  static init({ apiKey }) {
    if (!apiKey) {
      throw new Error("API key is missing");
    }
    this.apiKey = apiKey; // Set the API key

    const body = document.querySelector("body");

    // Create and append the widget container dynamically
    const container = document.createElement("div");
    container.id = "widgetcontainer";
    body.append(container);

    // Initial "Get Recommendation" button
    container.innerHTML = `
      <button id="getRecommendationBtn" class="recommendation-btn">
        Get Recommendation
      </button>
    `;

    const button = container.querySelector("#getRecommendationBtn");
    button.addEventListener("click", DiscWidget.showQuestionForm);

    // Append styles
    const style = document.createElement("style");
    style.textContent = DiscWidget.styles();
    document.head.appendChild(style);
  }

  static showQuestionForm() {
    const container = document.getElementById("widgetcontainer");

    // Replace the button with the multi-step form and close button
    container.innerHTML = `
      <div class="disc-widget">
        <button class="close-btn font-poppins" id="closeWidget">✕</button>
        <h3 class="widget-title font-poppins">Disc Recommendation Tool</h3>
        <form id="discForm">
          <div id="step-1" class="step active">
            <label class="font-poppins" for="name1">Favorite Disc Name:</label>
            <input class="font-poppins" type="text" id="name1" name="name1" placeholder="Enter Name" required />
            <label class="font-poppins" for="flightNumbers1">Flight Numbers:</label>
            <input class="font-poppins" type="text" id="flightNumbers1" name="flightNumbers1" placeholder="Enter Flight Numbers" required />
            <label class="font-poppins" for="weight1">Weight (g):</label>
            <input class="font-poppins" type="number" id="weight1" name="weight1" placeholder="Enter Weight" required />
            <label class="font-poppins" for="distance1">Distance (ft):</label>
            <input class="font-poppins" type="number" id="distance1" name="distance1" placeholder="Enter Distance" required />
            <button type="button" id="next1" class="btn btn-next font-poppins">Next</button>
          </div>
          <div id="step-2" class="step">
            <label class="font-poppins" for="name2">Favorite Disc Name:</label>
            <input class="font-poppins" type="text" id="name2" name="name2" placeholder="Enter Name" required />
            <label class="font-poppins" for="flightNumbers2">Flight Numbers:</label>
            <input class="font-poppins" type="text" id="flightNumbers2" name="flightNumbers2" placeholder="Enter Flight Numbers" required />
            <label class="font-poppins" for="weight2">Weight (g):</label>
            <input class="font-poppins" type="number" id="weight2" name="weight2" placeholder="Enter Weight" required />
            <label class="font-poppins" for="distance2">Distance (ft):</label>
            <input class="font-poppins" type="number" id="distance2" name="distance2" placeholder="Enter Distance" required />
            <button type="button" id="prev1" class="btn btn-prev font-poppins">Back</button>
            <button type="button" id="next2" class="btn btn-next font-poppins">Next</button>
          </div>
          <div id="step-3" class="step">
            <label class="font-poppins" for="name3">Favorite Disc Name:</label>
            <input class="font-poppins" type="text" id="name3" name="name3" placeholder="Enter Name" required />
            <label class="font-poppins" for="flightNumbers3">Flight Numbers:</label>
            <input class="font-poppins" type="text" id="flightNumbers3" name="flightNumbers3" placeholder="Enter Flight Numbers" required />
            <label class="font-poppins" for="weight3">Weight (g):</label>
            <input class="font-poppins" type="number" id="weight3" name="weight3" placeholder="Enter Weight" required />
            <label class="font-poppins" for="distance3">Distance (ft):</label>
            <input class="font-poppins" type="number" id="distance3" name="distance3" placeholder="Enter Distance" required />
            <button type="button" id="prev2" class="btn btn-prev font-poppins">Back</button>
            <button type="submit" class="btn btn-submit font-poppins" id="submitBtn">Submit</button>
          </div>
        </form>
        <div id="recommendations"></div>
      </div>
    `;

    DiscWidget.setupFormNavigation();

    // Close button functionality
    const closeBtn = document.getElementById("closeWidget");
    closeBtn.addEventListener("click", () => {
      container.innerHTML = `
         <button id="getRecommendationBtn" class="recommendation-btn">
          💬 Get Recommendation
         </button>
      `;
      const button = container.querySelector("#getRecommendationBtn");
      button.addEventListener("click", DiscWidget.showQuestionForm);
    });
  }

  static setupFormNavigation() {
    const steps = document.querySelectorAll(".step");
    const nextButtons = [
      document.getElementById("next1"),
      document.getElementById("next2"),
    ];
    const prevButtons = [
      document.getElementById("prev1"),
      document.getElementById("prev2"),
    ];

    let currentStep = 0;

    const showStep = (stepIndex) => {
      steps.forEach((step, index) => {
        step.classList.toggle("active", index === stepIndex);
      });
      currentStep = stepIndex;
    };

    nextButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        const step = steps[currentStep];
        const inputs = step.querySelectorAll("input[required]");
        let valid = true;

        inputs.forEach((input) => {
          if (!input.value) {
            input.style.border = "1px solid red";
            valid = false;
          } else {
            input.style.border = "";
          }
        });

        if (valid) {
          showStep(index + 1);
        }
      });
    });

    prevButtons.forEach((button, index) => {
      button.addEventListener("click", () => showStep(index));
    });

    const form = document.querySelector("#discForm");
    form.addEventListener("submit", DiscWidget.handleSubmit);
  }

  static async handleSubmit(event) {
    event.preventDefault();
    const submitBtn = document.getElementById("submitBtn");

    // Show loading spinner on submit button
    submitBtn.innerHTML = "Submitting...";
    submitBtn.disabled = true;

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(
        "https://disc-recommend-backend.vercel.app/api/recommendations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": DiscWidget.apiKey,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const recommendations = await response.json();

      const recommendationsDiv = document.getElementById("discForm");
      recommendationsDiv.innerHTML = `
        <h4 class="widget-description font-poppins">Recommended Discs:</h4>
          ${recommendations
            .map(
              (rec) => `
                  <div class="product" >
                    <p class="product-title font-poppins">
                    ${rec.discName} (${rec.discWeight}g)
                    </p>
                    <a href=${rec.purchaseUrl} class="product-url font-poppins">${rec.purchaseUrl}</a>
                  </div>
                 `
            )
            .join("")}
      `;
    } catch (error) {
      // Show error message above the form
      alert(error.message);
    } finally {
      // Revert button to its original state
      submitBtn.innerHTML = "Submit";
      submitBtn.disabled = false;
    }
  }

  static styles() {
    return `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
      /* General styles */
      #widgetcontainer {
        padding:10px;
      }

      .font-poppins {
        font-family: "Poppins", serif;
      }

      .alert {
          padding: 10px;
          background-color: #f8d7da;
          color: #721c24;
          border-radius: 5px;
          margin-bottom: 15px;
          font-size: 14px;
        }

        .alert-error {
          border: 1px solid #f5c6cb;
          background-color: #f8d7da;
          color: #721c24;
        }
 .recommendation-btn {
        background-color: #007bff;
        color: white;
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 2000;
        border: none;
        border-radius: 8px;
        padding: 12px 20px;
        font-size: 16px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        cursor: pointer;
      }

      /* Chat-like widget container */
      .disc-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        background-color: #fff;
        color: #333;
        padding: 20px;
        border-radius: 12px;
        width: 380px;
        max-height: 70vh; /* Limit height */
        overflow-y: auto; /* Enable scrolling */
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        font-family: Arial, sans-serif;
      }

      /* Step container adjustments */
      .step {
        display: none;
        padding-right: 10px; /* Add space for scrollbar */
      }

      .step.active {
        display: flex;
        flex-direction: column;
      }

      /* Ensure form elements fit */
      input {
        width: 95%;
        margin-bottom: 10px;
      }

      /* Recommendations scroll area */
      #recommendations {
        max-height: 300px;
        overflow-y: auto;
        margin-top: 15px;
      }
          /* Loading spinner for Submit button */
          .spinner {
            border: 1px solid #f3f3f3;
            border-top: 1px solid #3498db;
            border-radius: 50%;
            width: 30px !important;
            height: 30px !important;
            animation: spin 2s linear infinite;
            margin-left: 8px;
          }

        

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .recommendation-btn:hover {
            background-color: #0056b3;
          }

          .product {
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            padding: 5px;
            margin-top:10px

          }
          .widget-title {
            margin-bottom: 15px;
            text-align: center;
            font-size: 1.25rem;
            font-weight: bold;
            color: #007bff;

          }
          .widget-description {
            margin-bottom: 15px;
            font-size: 1.15rem;
            font-weight: bold;
            color: black;
          }
          .product-title {
            font-size: 1rem;
            font-weight: bold;
            color: black;
          }
          .step {
            display: none;
          }

          .step.active {
            display: flex;
            flex-direction:column;
            width:100%;
            overflow:hidden;
          }

          .btn {
            margin-top: 10px;
            padding: 10px 15px;

            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            width: 100%;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          .btn-next {
            background-color: #007bff;
            color: white;
          }

          .btn-prev {
            background-color: #6c757d;
            color: white;

          }

          .btn-submit {
            background-color: #28a745;
            color: white;

          }

          .btn:hover {
            opacity: 0.9;

          }

          .close-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            font-size: 18px;
            color: #333;
            cursor: pointer;
          }

          .close-btn:hover {
            color: #ff0000;
          }

          input {
            display: block;
            width: 95%;
            margin-bottom: 10px;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 14px;
          }

          input:focus {
            outline: none;
            border-color: #007bff;
          } 
    `;
  }
}

// Exporting for embedding
window.DiscWidget = DiscWidget;
