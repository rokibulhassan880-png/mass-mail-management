const STORAGE_KEY = "messMealManagementDataV1";

const defaultData = {
  members: [],
  meals: [],
  expenses: [],
  stocks: [],
  stockUses: [],
  buaBills: [],
  otherExpenses: [],
  deposits: []
};

let data = loadData();

const $ = (id) => document.getElementById(id);
const today = () => new Date().toISOString().slice(0, 10);
const currentMonth = () => new Date().toISOString().slice(0, 7);
const money = (value) => `Tk ${Number(value || 0).toFixed(2)}`;
const number = (value) => Number(value || 0);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const breakfastMenus = {
  khichuri: "Khichuri + Dim",
  porota: "2 Porota + Dim + Dal"
};
const regularMealMenus = {
  fish: "Fish Meal",
  meat: "Meat Meal"
};
const breakfastRecipes = {
  khichuri: [
    { item: "Chal", quantity: 100, unit: "gram" },
    { item: "Dal", quantity: 30, unit: "gram" },
    { item: "Dim", quantity: 1, unit: "piece", gramEquivalent: 10 },
    { item: "Tel", quantity: 20, unit: "ml" },
    { item: "Kacha Bazar Moshla", quantity: 10, unit: "gram" }
  ],
  porota: [
    { item: "Ata", quantity: 100, unit: "gram" },
    { item: "Tel", quantity: 30, unit: "ml" },
    { item: "Dim", quantity: 1, unit: "piece", gramEquivalent: 10 },
    { item: "Dal", quantity: 30, unit: "gram" }
  ]
};
const regularMealRecipes = {
  fish: [
    { item: "Chal", quantity: 100, unit: "gram" },
    { item: "Dal", quantity: 50, unit: "gram" },
    { item: "Mach", quantity: 1, unit: "piece" },
    { item: "Kacha Bazar Moshla", quantity: 20, unit: "gram" }
  ],
  meat: [
    { item: "Mangsho", quantity: 2, unit: "piece" },
    { item: "Chal", quantity: 100, unit: "gram" },
    { item: "Dal", quantity: 50, unit: "gram" },
    { item: "Kacha Bazar Moshla", quantity: 20, unit: "gram" }
  ]
};
const itemAliases = {
  ata: "ata",
  flour: "ata",
  chal: "chal",
  dal: "dal",
  dim: "dim",
  egg: "dim",
  mach: "mach",
  fish: "mach",
  mangsho: "mangsho",
  meat: "mangsho",
  tel: "tel",
  oil: "tel",
  "kacha bazar moshla": "kacha bazar moshla",
  "kacha bazar": "kacha bazar moshla",
  "kacha moshla": "kacha bazar moshla",
  masala: "kacha bazar moshla",
  moshla: "kacha bazar moshla",
  piyaj: "kacha bazar moshla",
  peyaj: "kacha bazar moshla",
  onion: "kacha bazar moshla",
  roshun: "kacha bazar moshla",
  rosun: "kacha bazar moshla",
  garlic: "kacha bazar moshla",
  ada: "kacha bazar moshla",
  ginger: "kacha bazar moshla",
  morich: "kacha bazar moshla",
  chili: "kacha bazar moshla"
};

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultData);
  try {
    return { ...structuredClone(defaultData), ...JSON.parse(saved) };
  } catch (error) {
    alert("Saved data could not be loaded. Starting with empty data.");
    return structuredClone(defaultData);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function selectedMonth() {
  return $("monthFilter").value || currentMonth();
}

function isInSelectedMonth(dateValue) {
  return String(dateValue || "").slice(0, 7) === selectedMonth();
}

function getMemberName(memberId) {
  const member = data.members.find((item) => item.id === memberId);
  return member ? member.name : "Unknown";
}

function activeMembers() {
  return data.members.filter((member) => member.active);
}

function totalMealOf(entry) {
  return number(entry.breakfast) + number(entry.lunch) + number(entry.dinner);
}

function mealBreakfastName(type) {
  return breakfastMenus[type] || "-";
}

function mealRegularName(type) {
  return regularMealMenus[type] || "-";
}

function normalizeItemName(item) {
  const key = String(item || "").trim().toLowerCase();
  return itemAliases[key] || key;
}

function normalizeUnit(unit) {
  const key = String(unit || "").trim().toLowerCase();
  const aliases = {
    g: "gram",
    gm: "gram",
    gram: "gram",
    grams: "gram",
    kg: "kg",
    kilogram: "kg",
    kilograms: "kg",
    ml: "ml",
    milliliter: "ml",
    milliliters: "ml",
    l: "liter",
    litre: "liter",
    liter: "liter",
    litres: "liter",
    liters: "liter",
    pc: "piece",
    pcs: "piece",
    piece: "piece",
    pieces: "piece",
    pices: "piece"
  };
  return aliases[key] || key;
}

function convertedRecipeQuantity(ingredient, stockUnit) {
  const unit = normalizeUnit(stockUnit);
  if (ingredient.unit === "gram") {
    if (unit === "kg") return ingredient.quantity / 1000;
    return ingredient.quantity;
  }
  if (ingredient.unit === "ml") {
    if (unit === "liter") return ingredient.quantity / 1000;
    return ingredient.quantity;
  }
  if (ingredient.unit === "piece") {
    if (unit === "gram") return ingredient.gramEquivalent || ingredient.quantity;
    if (unit === "kg") return (ingredient.gramEquivalent || ingredient.quantity) / 1000;
    return ingredient.quantity;
  }
  return ingredient.quantity;
}

function stockLabel(stock) {
  return stock.quantity <= 0 ? "Out of Stock" : `${stock.quantity.toFixed(2)} ${stock.unit || "unit"}`;
}

function monthlyMeals() {
  return data.meals.filter((meal) => isInSelectedMonth(meal.date));
}

function monthlyExpenses() {
  return data.expenses.filter((expense) => isInSelectedMonth(expense.date));
}

function monthlyDeposits() {
  return data.deposits.filter((deposit) => isInSelectedMonth(deposit.date));
}

function monthlyOtherExpenses() {
  return data.otherExpenses.filter((expense) => isInSelectedMonth(expense.date));
}

function monthTotals() {
  const meals = monthlyMeals();
  const expenses = monthlyExpenses();
  const deposits = monthlyDeposits();
  const otherExpenses = monthlyOtherExpenses();
  const totalMeals = meals.reduce((sum, meal) => sum + totalMealOf(meal), 0);
  const totalExpense = expenses.reduce((sum, expense) => sum + number(expense.amount), 0);
  const totalDeposit = deposits.reduce((sum, deposit) => sum + number(deposit.amount), 0);
  const totalOtherExpense = otherExpenses.reduce((sum, expense) => sum + number(expense.amount), 0);
  const buaBill = getCurrentBuaBill();
  const mealRate = totalMeals > 0 ? totalExpense / totalMeals : 0;
  return { meals, expenses, deposits, otherExpenses, totalMeals, totalExpense, totalDeposit, totalOtherExpense, buaBill, mealRate };
}

function getCurrentBuaBill() {
  return data.buaBills.find((bill) => bill.month === selectedMonth()) || { amount: 0, note: "" };
}

function calculateMemberBills() {
  const totals = monthTotals();
  const active = activeMembers();
  const buaShare = active.length ? number(totals.buaBill.amount) / active.length : 0;
  const otherShare = active.length ? number(totals.totalOtherExpense) / active.length : 0;

  return data.members.map((member) => {
    const memberMeals = totals.meals
      .filter((meal) => meal.memberId === member.id)
      .reduce((sum, meal) => sum + totalMealOf(meal), 0);
    const mealCost = memberMeals * totals.mealRate;
    const deposit = totals.deposits
      .filter((item) => item.memberId === member.id)
      .reduce((sum, item) => sum + number(item.amount), 0);
    const memberBuaShare = member.active ? buaShare : 0;
    const otherExpense = member.active ? otherShare : 0;
    const totalCost = mealCost + memberBuaShare + otherExpense;
    const balance = totalCost - deposit;
    return { member, memberMeals, mealCost, buaShare: memberBuaShare, otherExpense, deposit, totalCost, balance };
  });
}

function stockSummary(excludeAutoMealId = "") {
  const map = {};

  data.stocks.forEach((stock) => {
    const key = normalizeItemName(stock.item);
    if (!map[key]) {
      map[key] = { item: stock.item.trim(), quantity: 0, unit: stock.unit, price: 0 };
    }
    map[key].quantity += number(stock.quantity);
    map[key].price += number(stock.price);
    map[key].unit = stock.unit || map[key].unit;
  });

  data.stockUses.forEach((use) => {
    if (excludeAutoMealId && use.autoMealId === excludeAutoMealId) return;
    const key = normalizeItemName(use.item);
    if (!map[key]) {
      map[key] = { item: use.item.trim(), quantity: 0, unit: "", price: 0 };
    }
    map[key].quantity -= number(use.quantity);
  });

  return Object.values(map).sort((a, b) => a.item.localeCompare(b.item));
}

function recipeNeedsForMeal(meal) {
  const grouped = {};

  function addRecipe(recipe, count) {
    if (!recipe || count <= 0) return;
    recipe.forEach((ingredient) => {
      const key = normalizeItemName(ingredient.item);
      if (!grouped[key]) {
        grouped[key] = { ...ingredient, quantity: 0 };
      }
      grouped[key].quantity += ingredient.quantity * count;
    });
  }

  addRecipe(breakfastRecipes[meal.breakfastType], number(meal.breakfast));
  addRecipe(regularMealRecipes[meal.lunchType], number(meal.lunch));
  addRecipe(regularMealRecipes[meal.dinnerType], number(meal.dinner));

  return Object.values(grouped);
}

function checkRecipeStock(meal, excludeAutoMealId = "") {
  const needs = recipeNeedsForMeal(meal);
  const stocks = stockSummary(excludeAutoMealId);
  const missing = [];

  needs.forEach((ingredient) => {
    const stock = stocks.find((entry) => normalizeItemName(entry.item) === normalizeItemName(ingredient.item));
    if (!stock || stock.quantity <= 0) {
      missing.push(`${ingredient.item}: Out of Stock`);
      return;
    }
    const requiredInStockUnit = convertedRecipeQuantity(ingredient, stock.unit);
    if (requiredInStockUnit > stock.quantity) {
      missing.push(`${ingredient.item}: need ${requiredInStockUnit.toFixed(2)} ${stock.unit || ingredient.unit}, available ${stockLabel(stock)}`);
    }
  });

  return { ok: missing.length === 0, missing, needs, stocks };
}

function addAutoStockUsageForMeal(meal, stocks) {
  recipeNeedsForMeal(meal).forEach((ingredient) => {
    const stock = stocks.find((entry) => normalizeItemName(entry.item) === normalizeItemName(ingredient.item));
    if (!stock) return;
    data.stockUses.push({
      id: uid(),
      item: stock.item,
      quantity: convertedRecipeQuantity(ingredient, stock.unit),
      date: meal.date,
      note: "Auto used for meal cooking",
      autoMealId: meal.id
    });
  });
}

function removeAutoStockUsageForMeal(mealId) {
  data.stockUses = data.stockUses.filter((use) => use.autoMealId !== mealId);
}

function renderAll() {
  renderMemberOptions();
  renderDashboard();
  renderMembers();
  renderMeals();
  renderExpenses();
  renderStocks();
  renderBua();
  renderOtherExpenses();
  renderDeposits();
  renderBill();
}

function renderDashboard() {
  const totals = monthTotals();
  const bills = calculateMemberBills();
  const grandExpense = totals.totalExpense + totals.totalOtherExpense + number(totals.buaBill.amount);
  const due = bills.reduce((sum, bill) => sum + Math.max(bill.balance, 0), 0);
  const advance = bills.reduce((sum, bill) => sum + Math.max(-bill.balance, 0), 0);
  const lows = stockSummary().filter((stock) => stock.quantity < 2);
  const collectionPercent = grandExpense > 0 ? Math.min((totals.totalDeposit / grandExpense) * 100, 100) : 0;

  $("dashboardHero").innerHTML = `
    <div class="hero-copy">
      <span class="dashboard-chip">${selectedMonth()}</span>
      <h2>Monthly Snapshot</h2>
      <p>Quick view of meals, expenses, deposits, due and advance for this month.</p>
      <div class="hero-main-number">
        <span>Total Meals</span>
        <strong>${totals.totalMeals}</strong>
      </div>
    </div>
    <div class="hero-meter" style="--progress:${collectionPercent * 3.6}deg">
      <div class="meter-ring">
        <span>${collectionPercent.toFixed(0)}%</span>
        <small>Deposit</small>
      </div>
    </div>
    <div class="hero-mini-grid">
      <div><span>Meal Rate</span><strong>${money(totals.mealRate)}</strong></div>
      <div><span>Grand Expense</span><strong>${money(grandExpense)}</strong></div>
      <div><span>Total Deposit</span><strong>${money(totals.totalDeposit)}</strong></div>
      <div><span>Active Members</span><strong>${activeMembers().length}</strong></div>
    </div>
  `;

  const cards = [
    { label: "Members", value: data.members.length, tone: "members" },
    { label: "Bazar", value: money(totals.totalExpense), tone: "expense" },
    { label: "Bua Bill", value: money(totals.buaBill.amount), tone: "rate" },
    { label: "Other Exp.", value: money(totals.totalOtherExpense), tone: "meal" },
    { label: "Due", value: money(due), tone: "due" },
    { label: "Advance", value: money(advance), tone: "advance" }
  ];

  $("dashboardCards").innerHTML = cards.map((card) => `
    <article class="dashboard-kpi ${card.tone}">
      <div>
        <span>${card.label}</span>
        <strong>${card.value}</strong>
      </div>
    </article>
  `).join("");

  $("lowStockList").innerHTML = lows.length
    ? lows.map((stock) => `
      <div class="stock-radar-item">
        <div>
          <strong>${stock.item}</strong>
          <span>${stock.quantity <= 0 ? "Out of Stock" : `${stockLabel(stock)} left`}</span>
        </div>
        <span class="badge ${stock.quantity <= 0 ? "out" : "low"}">${stock.quantity <= 0 ? "Out" : "Low"}</span>
      </div>
    `).join("")
    : `<div class="empty-state">No low stock alerts.</div>`;

  $("dashboardDueRows").innerHTML = bills.length
    ? bills.map((bill) => `
      <div class="member-balance-card ${bill.balance > 0 ? "has-due" : bill.balance < 0 ? "has-advance" : "settled"}">
        <div class="member-balance-info">
          <strong>${bill.member.name}</strong>
          <span>${bill.memberMeals} meals this month</span>
        </div>
        <div class="member-balance-money">
          ${bill.balance > 0 ? `<span class="badge due">Due ${money(bill.balance)}</span>` : ""}
          ${bill.balance < 0 ? `<span class="badge advance">Advance ${money(Math.abs(bill.balance))}</span>` : ""}
          ${Math.abs(bill.balance) < 0.01 ? `<span class="badge">Settled</span>` : ""}
        </div>
      </div>
    `).join("")
    : `<div class="empty-state">No members yet.</div>`;
}

function renderMemberOptions() {
  const options = activeMembers().map((member) => `<option value="${member.id}">${member.name}</option>`).join("");
  $("mealMember").innerHTML = options || `<option value="">Add active member first</option>`;
  $("depositMember").innerHTML = options || `<option value="">Add active member first</option>`;

  const stockOptions = stockSummary().map((stock) => `<option value="${stock.item}">${stock.item} (${stockLabel(stock)})</option>`).join("");
  $("useStockItem").innerHTML = stockOptions || `<option value="">Add stock first</option>`;
}

function renderMembers() {
  $("memberRows").innerHTML = data.members.length
    ? data.members.map((member) => `
      <tr>
        <td>${member.name}</td>
        <td>${member.phone || "-"}</td>
        <td><span class="badge ${member.active ? "" : "inactive"}">${member.active ? "Active" : "Inactive"}</span></td>
        <td>
          <button class="small-btn" onclick="editMember('${member.id}')">Edit</button>
          <button class="small-btn delete" onclick="deleteMember('${member.id}')">Delete</button>
        </td>
      </tr>
    `).join("")
    : `<tr><td colspan="4" class="empty-state">No members added yet.</td></tr>`;
}

function renderMeals() {
  const meals = monthlyMeals().sort((a, b) => b.date.localeCompare(a.date));
  const total = meals.reduce((sum, meal) => sum + totalMealOf(meal), 0);
  $("mealTotalLabel").textContent = `Total: ${total}`;
  $("mealRows").innerHTML = meals.length
    ? meals.map((meal) => `
      <tr>
        <td>${meal.date}</td>
        <td>${getMemberName(meal.memberId)}</td>
        <td>${mealBreakfastName(meal.breakfastType)}</td>
        <td>${meal.breakfast}</td>
        <td>${mealRegularName(meal.lunchType)}</td>
        <td>${meal.lunch}</td>
        <td>${mealRegularName(meal.dinnerType)}</td>
        <td>${meal.dinner}</td>
        <td>${totalMealOf(meal)}</td>
        <td>
          <button class="small-btn" onclick="editMeal('${meal.id}')">Edit</button>
          <button class="small-btn delete" onclick="deleteMeal('${meal.id}')">Delete</button>
        </td>
      </tr>
    `).join("")
    : `<tr><td colspan="10" class="empty-state">No meal entries for this month.</td></tr>`;
}

function renderExpenses() {
  const expenses = monthlyExpenses().sort((a, b) => b.date.localeCompare(a.date));
  const total = expenses.reduce((sum, expense) => sum + number(expense.amount), 0);
  $("expenseTotalLabel").textContent = `Total: ${money(total)}`;
  $("expenseRows").innerHTML = expenses.length
    ? expenses.map((expense) => `
      <tr>
        <td>${expense.date}</td>
        <td>${expense.buyer}</td>
        <td>${expense.item}</td>
        <td>${money(expense.amount)}</td>
        <td>${expense.note || "-"}</td>
        <td>
          <button class="small-btn" onclick="editExpense('${expense.id}')">Edit</button>
          <button class="small-btn delete" onclick="deleteExpense('${expense.id}')">Delete</button>
        </td>
      </tr>
    `).join("")
    : `<tr><td colspan="6" class="empty-state">No expenses for this month.</td></tr>`;
}

function renderStocks() {
  const stocks = stockSummary();
  $("stockRows").innerHTML = stocks.length
    ? stocks.map((stock) => {
      const isOut = stock.quantity <= 0;
      const isLow = stock.quantity > 0 && stock.quantity < 2;
      return `
        <tr>
          <td>${stock.item}</td>
          <td>${isOut ? `<span class="badge out">Out of Stock</span>` : stock.quantity.toFixed(2)}</td>
          <td>${stock.unit || "-"}</td>
          <td>${money(stock.price)}</td>
          <td><span class="badge ${isOut ? "out" : isLow ? "low" : ""}">${isOut ? "Out of Stock" : isLow ? "Low Stock" : "OK"}</span></td>
          <td><button class="small-btn delete" onclick="deleteStockItem('${stock.item}')">Delete Item</button></td>
        </tr>
      `;
    }).join("")
    : `<tr><td colspan="6" class="empty-state">No stock added yet.</td></tr>`;

  const uses = data.stockUses.filter((use) => isInSelectedMonth(use.date)).sort((a, b) => b.date.localeCompare(a.date));
  $("stockUseRows").innerHTML = uses.length
    ? uses.map((use) => `
      <tr>
        <td>${use.date}</td>
        <td>${use.item}</td>
        <td>${use.quantity}</td>
        <td><button class="small-btn delete" onclick="deleteStockUse('${use.id}')">Delete</button></td>
      </tr>
    `).join("")
    : `<tr><td colspan="4" class="empty-state">No stock usage this month.</td></tr>`;
}

function renderBua() {
  const bill = getCurrentBuaBill();
  $("buaMonth").value = selectedMonth();
  $("buaAmount").value = bill.amount || "";
  $("buaNote").value = bill.note || "";

  const activeCount = activeMembers().length;
  const share = activeCount ? number(bill.amount) / activeCount : 0;
  $("buaShareLabel").textContent = `Share: ${money(share)}`;
  $("buaRows").innerHTML = data.members.length
    ? data.members.map((member) => `
      <tr>
        <td>${member.name}</td>
        <td><span class="badge ${member.active ? "" : "inactive"}">${member.active ? "Active" : "Inactive"}</span></td>
        <td>${member.active ? money(share) : money(0)}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="3" class="empty-state">No members yet.</td></tr>`;
}

function renderDeposits() {
  const deposits = monthlyDeposits().sort((a, b) => b.date.localeCompare(a.date));
  const total = deposits.reduce((sum, deposit) => sum + number(deposit.amount), 0);
  $("depositTotalLabel").textContent = `Total: ${money(total)}`;
  $("depositRows").innerHTML = deposits.length
    ? deposits.map((deposit) => `
      <tr>
        <td>${deposit.date}</td>
        <td>${getMemberName(deposit.memberId)}</td>
        <td>${money(deposit.amount)}</td>
        <td>${deposit.note || "-"}</td>
        <td>
          <button class="small-btn" onclick="editDeposit('${deposit.id}')">Edit</button>
          <button class="small-btn delete" onclick="deleteDeposit('${deposit.id}')">Delete</button>
        </td>
      </tr>
    `).join("")
    : `<tr><td colspan="5" class="empty-state">No deposits for this month.</td></tr>`;
}

function renderOtherExpenses() {
  const expenses = monthlyOtherExpenses().sort((a, b) => b.date.localeCompare(a.date));
  const total = expenses.reduce((sum, expense) => sum + number(expense.amount), 0);
  $("otherTotalLabel").textContent = `Total: ${money(total)}`;
  $("otherRows").innerHTML = expenses.length
    ? expenses.map((expense) => `
      <tr>
        <td>${expense.date}</td>
        <td>${expense.name}</td>
        <td>${money(expense.amount)}</td>
        <td>${expense.note || "-"}</td>
        <td>
          <button class="small-btn" onclick="editOtherExpense('${expense.id}')">Edit</button>
          <button class="small-btn delete" onclick="deleteOtherExpense('${expense.id}')">Delete</button>
        </td>
      </tr>
    `).join("")
    : `<tr><td colspan="5" class="empty-state">No other expenses for this month.</td></tr>`;
}

function renderBill() {
  const totals = monthTotals();
  const activeCount = activeMembers().length;
  const buaShare = activeCount ? number(totals.buaBill.amount) / activeCount : 0;
  const otherShare = activeCount ? totals.totalOtherExpense / activeCount : 0;
  $("billMonthLabel").textContent = selectedMonth();
  $("billStats").innerHTML = [
    ["Total Meal", totals.totalMeals],
    ["Total Bazar", money(totals.totalExpense)],
    ["Meal Rate", money(totals.mealRate)],
    ["Bua Bill", money(totals.buaBill.amount)],
    ["Bua Share", money(buaShare)],
    ["Other Expense", money(totals.totalOtherExpense)],
    ["Other Share", money(otherShare)]
  ].map(([label, value]) => `<div class="bill-stat"><span>${label}</span><strong>${value}</strong></div>`).join("");

  const bills = calculateMemberBills();
  $("billRows").innerHTML = bills.length
    ? bills.map((bill) => {
      const finalText = bill.balance > 0
        ? `<span class="badge due">Due ${money(bill.balance)}</span>`
        : `<span class="badge advance">Advance ${money(Math.abs(bill.balance))}</span>`;
      return `
        <tr>
          <td>${bill.member.name}</td>
          <td>${bill.memberMeals}</td>
          <td>${money(bill.mealCost)}</td>
          <td>${money(bill.buaShare)}</td>
          <td>${money(bill.otherExpense)}</td>
          <td>${money(bill.deposit)}</td>
          <td>${Math.abs(bill.balance) < 0.01 ? money(0) : finalText}</td>
        </tr>
      `;
    }).join("")
    : `<tr><td colspan="7" class="empty-state">No members yet.</td></tr>`;
}

function resetForms() {
  ["memberForm", "mealForm", "expenseForm", "stockForm", "depositForm", "otherForm"].forEach((formId) => $(formId).reset());
  $("memberId").value = "";
  $("mealId").value = "";
  $("expenseId").value = "";
  $("stockId").value = "";
  $("depositId").value = "";
  $("otherId").value = "";
  $("mealBreakfastType").value = "";
  $("mealLunchType").value = "";
  $("mealDinnerType").value = "";
  setDefaultDates();
}

function setDefaultDates() {
  $("mealDate").value = today();
  $("expenseDate").value = today();
  $("stockDate").value = today();
  $("useStockDate").value = today();
  $("depositDate").value = today();
  $("otherDate").value = today();
}

function editMember(id) {
  const member = data.members.find((item) => item.id === id);
  if (!member) return;
  $("memberId").value = member.id;
  $("memberName").value = member.name;
  $("memberPhone").value = member.phone || "";
  $("memberActive").value = String(member.active);
  openTab("members");
}

function deleteMember(id) {
  if (!confirm("Delete this member? Related meals and deposits will stay for history.")) return;
  data.members = data.members.filter((member) => member.id !== id);
  saveData();
  renderAll();
}

function editMeal(id) {
  const meal = data.meals.find((item) => item.id === id);
  if (!meal) return;
  $("mealId").value = meal.id;
  $("mealDate").value = meal.date;
  $("mealMember").value = meal.memberId;
  $("mealBreakfastType").value = meal.breakfastType || "";
  $("mealBreakfast").value = meal.breakfast;
  $("mealLunchType").value = meal.lunchType || "";
  $("mealLunch").value = meal.lunch;
  $("mealDinnerType").value = meal.dinnerType || "";
  $("mealDinner").value = meal.dinner;
  openTab("meals");
}

function deleteMeal(id) {
  if (!confirm("Delete this meal entry?")) return;
  data.meals = data.meals.filter((meal) => meal.id !== id);
  removeAutoStockUsageForMeal(id);
  saveData();
  renderAll();
}

function editExpense(id) {
  const expense = data.expenses.find((item) => item.id === id);
  if (!expense) return;
  $("expenseId").value = expense.id;
  $("expenseDate").value = expense.date;
  $("expenseBuyer").value = expense.buyer;
  $("expenseItem").value = expense.item;
  $("expenseAmount").value = expense.amount;
  $("expenseNote").value = expense.note || "";
  openTab("expenses");
}

function deleteExpense(id) {
  if (!confirm("Delete this expense?")) return;
  data.expenses = data.expenses.filter((expense) => expense.id !== id);
  saveData();
  renderAll();
}

function deleteStockItem(item) {
  if (!confirm(`Delete all stock records for ${item}?`)) return;
  const key = item.trim().toLowerCase();
  data.stocks = data.stocks.filter((stock) => stock.item.trim().toLowerCase() !== key);
  data.stockUses = data.stockUses.filter((use) => use.item.trim().toLowerCase() !== key);
  saveData();
  renderAll();
}

function deleteStockUse(id) {
  if (!confirm("Delete this stock usage entry? Stock will be added back automatically.")) return;
  data.stockUses = data.stockUses.filter((use) => use.id !== id);
  saveData();
  renderAll();
}

function editDeposit(id) {
  const deposit = data.deposits.find((item) => item.id === id);
  if (!deposit) return;
  $("depositId").value = deposit.id;
  $("depositDate").value = deposit.date;
  $("depositMember").value = deposit.memberId;
  $("depositAmount").value = deposit.amount;
  $("depositNote").value = deposit.note || "";
  openTab("deposits");
}

function editOtherExpense(id) {
  const expense = data.otherExpenses.find((item) => item.id === id);
  if (!expense) return;
  $("otherId").value = expense.id;
  $("otherDate").value = expense.date;
  $("otherName").value = expense.name;
  $("otherAmount").value = expense.amount;
  $("otherNote").value = expense.note || "";
  openTab("other");
}

function deleteOtherExpense(id) {
  if (!confirm("Delete this other expense?")) return;
  data.otherExpenses = data.otherExpenses.filter((expense) => expense.id !== id);
  saveData();
  renderAll();
}

function deleteDeposit(id) {
  if (!confirm("Delete this deposit?")) return;
  data.deposits = data.deposits.filter((deposit) => deposit.id !== id);
  saveData();
  renderAll();
}

function openTab(tabId) {
  document.querySelectorAll(".tab-btn").forEach((button) => button.classList.toggle("active", button.dataset.tab === tabId));
  document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === tabId));
}

document.querySelectorAll(".tab-btn").forEach((button) => {
  button.addEventListener("click", () => openTab(button.dataset.tab));
});

document.querySelectorAll("select").forEach((select) => {
  select.addEventListener("change", () => {
    select.classList.remove("choice-pop");
    void select.offsetWidth;
    select.classList.add("choice-pop");
    setTimeout(() => select.classList.remove("choice-pop"), 560);
  });
});

$("monthFilter").addEventListener("change", renderAll);

$("memberForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const id = $("memberId").value;
  const member = {
    id: id || uid(),
    name: $("memberName").value.trim(),
    phone: $("memberPhone").value.trim(),
    active: $("memberActive").value === "true"
  };
  if (id) {
    data.members = data.members.map((item) => item.id === id ? member : item);
  } else {
    data.members.push(member);
  }
  saveData();
  resetForms();
  renderAll();
});

$("mealForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!$("mealMember").value) return alert("Please add an active member first.");
  const id = $("mealId").value;
  const breakfastCount = number($("mealBreakfast").value);
  const breakfastType = $("mealBreakfastType").value;
  const lunchCount = number($("mealLunch").value);
  const lunchType = $("mealLunchType").value;
  const dinnerCount = number($("mealDinner").value);
  const dinnerType = $("mealDinnerType").value;
  if (breakfastCount > 0 && !breakfastType) {
    return alert("Please select a breakfast menu.");
  }
  if (lunchCount > 0 && !lunchType) {
    return alert("Please select a lunch menu.");
  }
  if (dinnerCount > 0 && !dinnerType) {
    return alert("Please select a dinner menu.");
  }
  const meal = {
    id: id || uid(),
    date: $("mealDate").value,
    memberId: $("mealMember").value,
    breakfastType,
    breakfast: breakfastCount,
    lunchType,
    lunch: lunchCount,
    dinnerType,
    dinner: dinnerCount
  };
  const stockCheck = checkRecipeStock(meal, id);
  if (!stockCheck.ok) {
    alert(`Bazar out of stock:\n${stockCheck.missing.join("\n")}`);
    return;
  }
  if (id) {
    removeAutoStockUsageForMeal(id);
    data.meals = data.meals.map((item) => item.id === id ? meal : item);
  } else {
    data.meals.push(meal);
  }
  addAutoStockUsageForMeal(meal, stockCheck.stocks);
  saveData();
  resetForms();
  renderAll();
});

$("expenseForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const id = $("expenseId").value;
  const expense = {
    id: id || uid(),
    date: $("expenseDate").value,
    buyer: $("expenseBuyer").value.trim(),
    item: $("expenseItem").value.trim(),
    amount: number($("expenseAmount").value),
    note: $("expenseNote").value.trim()
  };
  if (id) {
    data.expenses = data.expenses.map((item) => item.id === id ? expense : item);
  } else {
    data.expenses.push(expense);
  }
  saveData();
  resetForms();
  renderAll();
});

$("stockForm").addEventListener("submit", (event) => {
  event.preventDefault();
  data.stocks.push({
    id: uid(),
    item: $("stockItem").value.trim(),
    quantity: number($("stockQuantity").value),
    unit: $("stockUnit").value.trim(),
    price: number($("stockPrice").value),
    date: $("stockDate").value
  });
  saveData();
  resetForms();
  renderAll();
});

$("stockUseForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const item = $("useStockItem").value;
  if (!item) return alert("Please add stock first.");
  const stock = stockSummary().find((entry) => entry.item === item);
  const usedQty = number($("useStockQuantity").value);
  if (usedQty <= 0) return alert("Please enter a valid used quantity.");
  if (!stock || stock.quantity <= 0) {
    return alert(`${item} is Out of Stock.`);
  }
  if (usedQty > stock.quantity) {
    return alert(`Only ${stock.quantity.toFixed(2)} ${stock.unit || "unit"} available. You cannot use more than current stock.`);
  }
  data.stockUses.push({
    id: uid(),
    item,
    quantity: usedQty,
    date: $("useStockDate").value
  });
  saveData();
  $("stockUseForm").reset();
  setDefaultDates();
  renderAll();
});

$("buaForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const bill = {
    month: $("buaMonth").value,
    amount: number($("buaAmount").value),
    note: $("buaNote").value.trim()
  };
  const exists = data.buaBills.some((item) => item.month === bill.month);
  data.buaBills = exists
    ? data.buaBills.map((item) => item.month === bill.month ? bill : item)
    : [...data.buaBills, bill];
  $("monthFilter").value = bill.month;
  saveData();
  renderAll();
});

$("depositForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!$("depositMember").value) return alert("Please add an active member first.");
  const id = $("depositId").value;
  const deposit = {
    id: id || uid(),
    date: $("depositDate").value,
    memberId: $("depositMember").value,
    amount: number($("depositAmount").value),
    note: $("depositNote").value.trim()
  };
  if (id) {
    data.deposits = data.deposits.map((item) => item.id === id ? deposit : item);
  } else {
    data.deposits.push(deposit);
  }
  saveData();
  resetForms();
  renderAll();
});

$("otherForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const id = $("otherId").value;
  const expense = {
    id: id || uid(),
    date: $("otherDate").value,
    name: $("otherName").value.trim(),
    amount: number($("otherAmount").value),
    note: $("otherNote").value.trim()
  };
  if (id) {
    data.otherExpenses = data.otherExpenses.map((item) => item.id === id ? expense : item);
  } else {
    data.otherExpenses.push(expense);
  }
  saveData();
  resetForms();
  renderAll();
});

$("printBtn").addEventListener("click", () => {
  openTab("bill");
  window.print();
});

$("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mess-data-${selectedMonth()}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

$("importBtn").addEventListener("click", () => {
  const file = $("importFile").files[0];
  if (!file) return alert("Please choose a JSON file first.");
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      data = { ...structuredClone(defaultData), ...imported };
      saveData();
      renderAll();
      alert("Data imported successfully.");
    } catch (error) {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
});

$("resetBtn").addEventListener("click", () => {
  const sure = confirm("Are you sure you want to delete all data?");
  if (!sure) return;
  const finalSure = confirm("Last confirmation: all members, meals, expenses, stock and deposits will be deleted.");
  if (!finalSure) return;
  data = structuredClone(defaultData);
  saveData();
  renderAll();
});

$("monthFilter").value = currentMonth();
setDefaultDates();
renderAll();
