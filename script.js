const listOfRequests = document.getElementById("listOfRequests");

const renderList = function (data, isPrepen = false) {
  const containerEl = document.createElement("div");
  containerEl.innerHTML = `
    <div class="card mb-3">
    <div class="card-body d-flex justify-content-between flex-row">
        <div class="d-flex flex-column">
        <h3>${data.topic_title}</h3>
        <p class="text-muted mb-2">${data.topic_details}</p>
        <p class="mb-0 text-muted">
            <strong>Expected results:</strong> ${data.expected_result}
        </p>
        </div>
        <div class="d-flex flex-column text-center">
        <a id="vote-up_${data._id}" class="btn btn-link">🔺</a>
        <h3 id="vote-score_${data._id}">${
    data.votes.ups - data.votes.downs
  }</h3>
        <a id="vote-down_${data._id}" class="btn btn-link">🔻</a>
        </div>
    </div>
    <div class="card-footer d-flex flex-row justify-content-between">
        <div>
        <span class="text-info">${data.status}</span>
        &bullet; added by <strong>${data.author_name}</strong> on
        <strong>${new Date(data.submit_date).toLocaleDateString()}</strong>
        </div>
        <div
        class="d-flex justify-content-center flex-column 408ml-auto mr-2"
        >
        <div class="badge badge-success">${data.target_level}</div>
        </div>
    </div>
    </div>
    `;

  if (isPrepen) listOfRequests.prepend(containerEl);
  else listOfRequests.appendChild(containerEl);

  const btnVoteUp = document.getElementById(`vote-up_${data._id}`);
  const btnVoteDown = document.getElementById(`vote-down_${data._id}`);
  const voteScoreEl = document.getElementById(`vote-score_${data._id}`);

  btnVoteUp.addEventListener("click", function (e) {
    console.log(e);
    fetch("http://localhost:7777/video-request/vote", {
      method: "PUT",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify({ id: data._id, vote_type: "ups" }),
    })
      .then((bolb) => bolb.json())
      .then((res) => {
        console.log(res);
        voteScoreEl.innerText = res.ups - res.downs;
      });
  });

  btnVoteDown.addEventListener("click", function (e) {
    console.log(e);
    fetch("http://localhost:7777/video-request/vote", {
      method: "PUT",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify({ id: data._id, vote_type: "downs" }),
    })
      .then((bolb) => bolb.json())
      .then((res) => {
        console.log(res);
        voteScoreEl.innerText = res.ups - res.downs;
      });
  });

  return containerEl;
};

const fetchAll = function (sortBy = "", searchTerm = "") {
  fetch(
    `http://localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searchTerm}`
  )
    .then((res) => res.json())
    .then((lists) => {
      listOfRequests.innerHTML = "";
      lists.forEach((data) => {
        // console.log(data);
        renderList(data);
      });
    });
};

const debounce = function (fn, time) {
  let timeout;

  return function (args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.call(this, args), time);
  };
};

document.addEventListener("DOMContentLoaded", function () {
  const formVidReq = document.getElementById("formVideoRequest");
  const sortByEl = document.querySelectorAll("[id*=sort_by_]");
  const search = document.getElementById("search_box");
  let sortBy = "newFirst";
  let searchTerm = "";
  fetchAll();

  sortByEl.forEach((el) => {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      sortBy = this.querySelector("input").value;

      fetchAll(sortBy, searchTerm);

      this.classList.add("active");
      if (sortBy === "topVotedFirst") {
        document.getElementById("sort_by_new").classList.remove("active");
      } else {
        document.getElementById("sort_by_top").classList.remove("active");
      }
    });
  });

  search.addEventListener(
    "input",
    debounce(function (e) {
      searchTerm = search.value;

      fetchAll(sortBy, searchTerm);
    }, 300)
  );

  formVidReq.addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(formVidReq);

    fetch("http://localhost:7777/video-request", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => renderList(data, true));
  });
});
