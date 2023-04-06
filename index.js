function renderTodoList(todoList) {
  let ulList = document.querySelector("ul");
  if (!ulList) return;
  for (const todo of todoList) {
    let liElement = createTodo(todo);
    ulList.appendChild(liElement);
  }
}

function createTodo(todo) {
  // select template
  let template = document.querySelector(".to-do_template");
  if (!template) return;
  // clone template
  let liElement = template.content.cloneNode(true).querySelector("li");
  // set data
  liElement.querySelector(".todo_name").innerHTML = todo.name;
  liElement.dataset.id = todo.id;
  liElement.dataset.status = todo.status;

  let divElement = liElement.querySelector(".alert");
  divElement.classList.remove("alert-success", "alert-secondary");
  let finishBtn = liElement.querySelector(".btn-success");

  // initial state
  if (todo.status === "pending") {
    divElement.classList.add("alert-secondary");
    finishBtn.innerHTML = "Finish";
  } else {
    divElement.classList.add("alert-success");
    finishBtn.innerHTML = "Reset";
  }

  // add event listeners for finishBtn
  finishBtn.addEventListener("click", () => {
    // switch status on UI
    let todoList = getDataFromLocalStorage();
    let index = todoList.findIndex((item) => item.id === todo.id);
    todo = todoList[index];
    let curStatus = todo.status;
    if (curStatus === "pending") {
      divElement.classList.remove("alert-secondary");
      divElement.classList.add("alert-success");
      finishBtn.innerHTML = "Reset";
      liElement.dataset.status = "finished";
    } else {
      divElement.classList.remove("alert-success");
      divElement.classList.add("alert-secondary");
      finishBtn.innerHTML = "Finish";
      liElement.dataset.status = "pending";
    }

    // switch status on storage
    if (todo.status === "pending") {
      todo.status = "finished";
    } else {
      todo.status = "pending";
    }
    localStorage.setItem("todo_list", JSON.stringify(todoList));

    // search element
    searchTodoList(document.querySelector("#searchTerm").value);
  });

  // add event listeners for removeBtn
  let removeBtn = liElement.querySelector(".btn-danger");
  removeBtn.addEventListener("click", () => {
    console.log("remove");
    liElement.remove();

    // remove on storage
    let todoList = getDataFromLocalStorage();
    let filterData = todoList.filter((item) => item.id !== todo.id);
    localStorage.setItem("todo_list", JSON.stringify(filterData));
  });

  let editBtn = liElement.querySelector(".btn-edit");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      // lastest data
      let todoList = getDataFromLocalStorage();
      let index = todoList.findIndex((item) => item.id === todo.id);
      todo = todoList[index];
      // populate form
      populateTodoForm(todo);
    });
  }
  return liElement;
}

function populateTodoForm(todo) {
  // query todo form
  let todoForm = document.querySelector("#todoFormID");
  if (!todoForm) return;
  // dataset.id = todo.id
  todoForm.dataset.id = todo.id;

  // set values for form controls
  let todoInput = todoForm.querySelector("#todoText");
  if (!todoInput) return;
  todoInput.value = todo.name;
  // focus mouse
  todoInput.focus();
}

function getDataFromLocalStorage() {
  try {
    let data = localStorage.getItem("todo_list");
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function handleTodoFormSubmit(event) {
  event.preventDefault();

  let todoForm = document.querySelector("#todoFormID");
  // get form values
  const todoInput = document.getElementById("todoText");
  if (!todoInput) return;
  const todoText = todoInput.value;

  // add mode
  if (!todoForm.dataset.id) {
    const newTodo = {
      id: Date.now(),
      name: todoText,
      status: "pending",
    };
    // validate form values
    if (!todoText) return;
    // save
    let todoList = getDataFromLocalStorage();
    todoList.push(newTodo);
    localStorage.setItem("todo_list", JSON.stringify(todoList));
    // apply DOM changes
    let liElement = createTodo(newTodo);
    let ulList = document.querySelector("ul");
    if (!ulList) return;
    ulList.appendChild(liElement);
    // reset form
    todoInput.value = "";
  } else {
    // update mode
    let todoList = getDataFromLocalStorage();
    let index = todoList.findIndex((item) => item.id === +todoForm.dataset.id);
    let todo = todoList[index];
    todo.name = todoText;
    localStorage.setItem("todo_list", JSON.stringify(todoList));
    // apply DOM changes
    let liElement = document.querySelector(`li[data-id="${todo.id}"]`);
    if (!liElement) return;
    liElement.querySelector(".todo_name").innerHTML = todo.name;
    // reset form
    todoInput.value = "";
    todoForm.dataset.id = "";
  }
}

function initSearchInput() {
  // find search term input
  let searchInput = document.querySelector("#searchTerm");
  if (!searchInput) return;
  // register event listener
  searchInput.addEventListener("input", (event) => {
    searchTodoList(searchInput.value);
  });
}

function searchTodoList(value) {
  let todoElementList = getAllTodoElements();

  for (const todoElement of todoElementList) {
    todoElement.hidden = !isMatch(todoElement, value);
  }

  // save search
  saveSearchValue();
}

function isMatch(liElement, value) {
  let checkedValue = getCheckedRadioValue("radio-search");
  let todoStatus = liElement.dataset.status;
  let todoName = liElement.querySelector(".todo_name").innerHTML;
  if (!liElement) return false;
  if (checkedValue === "all") {
    if (value === "") return true;
    return todoName.toLowerCase().includes(value.toLowerCase());
  }

  if (value === "" && todoStatus === checkedValue)
    return todoStatus === checkedValue;
  return (
    todoName.toLowerCase().includes(value.toLowerCase()) &&
    todoStatus === checkedValue
  );
}

function getAllTodoElements() {
  return document.querySelectorAll("#todo-list > li");
}

function getCheckedRadioValue(radio_group_name) {
  let radio_group = document.getElementsByName(radio_group_name);
  for (let i = 0; i < radio_group.length; i++) {
    if (radio_group[i].checked) {
      return radio_group[i].value;
    }
  }
  return "";
}

function saveSearchValue() {
  let searchInput = document.querySelector("#searchTerm");
  if (!searchInput) return;
  localStorage.setItem("search_value", searchInput.value);
  // save check radio
  let checkedValue = getCheckedRadioValue("radio-search");
  localStorage.setItem("checked_value", checkedValue);
}

(() => {
  let todoList = getDataFromLocalStorage();
  renderTodoList(todoList);

  // search
  let searchValue = localStorage.getItem("search_value");
  let checkedValue = localStorage.getItem("checked_value");
  if (searchValue) {
    document.querySelector("#searchTerm").value = searchValue;
  }
  if (checkedValue) {
    document.querySelector(`input[value="${checkedValue}"]`).checked = true;
  }
  searchTodoList(document.querySelector("#searchTerm").value);

  // resgister submit event for todo form
  let todoForm = document.querySelector("#todoFormID");
  let radioGroup = document.querySelector("#radio-search");
  todoForm.addEventListener("submit", handleTodoFormSubmit);
  radioGroup.addEventListener("change", () => {
    searchTodoList(document.querySelector("#searchTerm").value);
  });
  initSearchInput();
})();
