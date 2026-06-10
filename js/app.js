import { NETWORKS, BTC_APIS, MIN_CONFIRMATIONS } from "./config.js";
import { ORDER_ABI, ISSUER_ABI, ERROR_INTERFACE } from "./abi.js";
import { LANG_STORAGE_KEY, I18N } from "./i18n.js";
import { state, elements } from "./state.js";

function setIconButtonText(button, text) {
  const svg = button.querySelector("svg");
  button.replaceChildren();
  if (svg) button.appendChild(svg);
  button.appendChild(document.createTextNode(text));
}

function setFieldLabelText(label, text) {
  const svg = label.querySelector("svg");
  label.replaceChildren();
  if (svg) label.appendChild(svg);
  label.appendChild(document.createTextNode(svg ? ` ${text}` : text));
}

function setFooterNote(html) {
  elements.formFooterNote.innerHTML = `<svg class="icon icon-sm icon-muted" aria-hidden="true"><use href="#icon-info"/></svg><span>${html}</span>`;
}

function setTopbarNote(text) {
  elements.topbarNote.innerHTML = `<svg class="icon icon-sm" aria-hidden="true"><use href="#icon-wallet"/></svg> ${escapeHtml(text)}`;
}

function setSubmitTag(text) {
  elements.submitTag.innerHTML = `<span class="live-dot" aria-hidden="true"></span>${escapeHtml(text)}`;
}

function getSelectedNetwork() {
  return NETWORKS[elements.network.value];
}

function getSelectedProofType() {
  return elements.proofType.value;
}

function t(key, vars = {}) {
  const dictionary = I18N[state.locale] || I18N.zh;
  const value = key.split(".").reduce((current, part) => current?.[part], dictionary);
  if (typeof value !== "string") {
    return key;
  }

  return value.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ""));
}

function setLocale(locale) {
  state.locale = locale === "en" ? "en" : "zh";
  try {
    localStorage.setItem(LANG_STORAGE_KEY, state.locale);
  } catch {}

  renderStaticTexts();
  renderWalletList();
  updateNetworkInfo();
  updateProofTypeHint();
  setWalletButton();

  if (state.account) {
    setWalletStatus(
      t("wallet.connected", {
        wallet: escapeHtml(state.walletLabel || t("wallet.defaultName")),
        account: escapeHtml(state.account),
        chainId: escapeHtml(state.chainIdHex || ""),
      }),
      "success"
    );
  } else {
    setWalletStatus(t("wallet.notConnected"), "warning");
  }

  if (!elements.actionStatus.textContent.trim() || elements.actionStatus.textContent.trim() === I18N.zh.status.waitingInput || elements.actionStatus.textContent.trim() === I18N.en.status.waitingInput) {
    setStatus(t("status.waitingInput"));
  }

  if (!elements.resultBox.textContent.trim() || elements.resultBox.textContent.trim() === I18N.zh.status.noResult || elements.resultBox.textContent.trim() === I18N.en.status.noResult) {
    setResult(t("status.noResult"));
  }
}

function renderStaticTexts() {
  document.title = t("meta.pageTitle");
  elements.brandTitle.textContent = t("meta.brandTitle");
  elements.brandSubtitle.textContent = t("meta.brandSubtitle");
  setTopbarNote(t("meta.topbarNote"));
  setIconButtonText(elements.languageToggleButton, t("meta.languageToggle"));
  elements.submitHeading.textContent = t("form.heading");
  elements.submitEyebrow.textContent = t("meta.submitEyebrow");
  elements.sidebarLabel.textContent = t("meta.sidebarLabel");
  setSubmitTag(t("meta.submitTag"));
  elements.configTitle.textContent = t("form.configTitle");
  setFieldLabelText(elements.networkLabel, t("form.networkLabel"));
  setFieldLabelText(elements.proofTypeLabel, t("form.proofTypeLabel"));
  elements.proofTypePledge.textContent = t("proofTypes.pledge");
  elements.proofTypeUnlock.textContent = t("proofTypes.unlock");
  elements.proofTypeRenewal.textContent = t("proofTypes.renewal");
  elements.proofTypeRenewalTopup.textContent = t("proofTypes.renewalTopup");
  elements.proofTypeRepayment.textContent = t("proofTypes.repayment");
  elements.proofTypeTimeoutRepay.textContent = t("proofTypes.timeoutRepay");
  elements.proofTypeExecuteIncrease.textContent = t("proofTypes.executeIncrease");
  elements.proofTypeCancelIncrease.textContent = t("proofTypes.cancelIncrease");
  elements.paramsTitle.textContent = t("form.paramsTitle");
  setFieldLabelText(elements.orderAddressLabel, t("form.orderAddressLabel"));
  elements.timeoutRepayEnabledLabel.textContent = t("form.timeoutRepayEnabledLabel");
  elements.timeoutRepayEnabledOn.textContent = t("form.timeoutRepayEnabledOn");
  elements.timeoutRepayEnabledOff.textContent = t("form.timeoutRepayEnabledOff");
  setFieldLabelText(elements.borrowerBtcLabel, t("form.borrowerBtcLabel"));
  elements.borrowerBtcAddress.placeholder = t("form.borrowerBtcPlaceholder");
  setFieldLabelText(elements.btcTxidLabel, t("form.btcTxidLabel"));
  elements.btcTxid.placeholder = t("form.btcTxidPlaceholder");
  updateSubmitButtonText();
  elements.networkCardTitle.textContent = t("cards.network");
  elements.issuerTitle.textContent = t("cards.issuer");
  elements.explorerTitle.textContent = t("cards.explorer");
  elements.walletCardTitle.textContent = t("cards.wallet");
  elements.actionCardTitle.textContent = t("cards.action");
  elements.resultCardTitle.textContent = t("cards.result");
  elements.walletModalTitle.textContent = t("wallet.modalTitle");
  setIconButtonText(elements.walletModalClose, t("wallet.modalClose"));
  setIconButtonText(elements.submitProof, t("form.submit"));
}

function setStatus(message, kind = "") {
  elements.actionStatus.className = `status-box ${kind}`.trim();
  elements.actionStatus.innerHTML = message;
}

function setWalletStatus(message, kind = "") {
  elements.walletStatus.className = `status-box ${kind}`.trim();
  elements.walletStatus.innerHTML = message;
}

function setResult(html) {
  elements.resultBox.innerHTML = html;
}

function getSubmitButtonIdleText() {
  const proofType = getSelectedProofType();
  if (proofType === "repayment") return t("form.submitRepayment");
  if (proofType === "timeout-repay") return t("form.submitTimeoutRepay");
  if (proofType === "execute-increase") return t("form.submitExecuteIncrease");
  if (proofType === "cancel-increase") return t("form.submitCancelIncrease");
  return t("form.submit");
}

function updateSubmitButtonText() {
  if (elements.submitProof.disabled) {
    return;
  }
  setIconButtonText(elements.submitProof, getSubmitButtonIdleText());
}

function getResultProofTypeLabel(proofType) {
  if (proofType === "pledge") return t("resultProofTypes.pledge");
  if (proofType === "unlock") return t("resultProofTypes.unlock");
  if (proofType === "renewal") return t("resultProofTypes.renewal");
  if (proofType === "repayment") return t("resultProofTypes.repayment");
  if (proofType === "timeout-repay") return t("resultProofTypes.timeoutRepay");
  if (proofType === "execute-increase") return t("resultProofTypes.executeIncrease");
  if (proofType === "cancel-increase") return t("resultProofTypes.cancelIncrease");
  if (proofType === "renewal-topup") return t("resultProofTypes.renewalTopup");
  return proofType;
}

function getTimeoutRepayEnabledLabel(enabled) {
  return enabled ? t("result.enabledOn") : t("result.enabledOff");
}

function setBusy(isBusy) {
  elements.submitProof.disabled = isBusy;
  elements.walletConnectButton.disabled = isBusy;
  setIconButtonText(elements.submitProof, isBusy ? t("form.processing") : getSubmitButtonIdleText());
}

function shortAddress(address) {
  if (!address) return "-";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}


const ERROR_STRING_SELECTOR = "0x08c379a0"; // Error(string) -> require(false, "msg") / revert("msg")
const PANIC_SELECTOR = "0x4e487b71";        // Panic(uint256)

// Revert data can be nested under different keys depending on wallet / provider / ethers
// code path. Walk the error object instead of guessing one fixed location.
function findRevertData(value, depth = 0) {
  if (value == null || depth > 8) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^0x[0-9a-fA-F]{8,}$/.test(trimmed)) return trimmed;
    if (trimmed.startsWith("{")) {
      try { return findRevertData(JSON.parse(trimmed), depth + 1); } catch { return null; }
    }
    return null;
  }
  if (typeof value !== "object") return null;
  for (const key of ["data", "error", "originalError", "cause", "info", "payload", "body", "result", "value", "revert"]) {
    if (key in value) {
      const found = findRevertData(value[key], depth + 1);
      if (found) return found;
    }
  }
  return null;
}

// Decode a contract revert into a readable message:
//   custom error -> error name (args appended when present, e.g. "BindingInUse(1, 0x..)")
//   require/revert string -> the raw string
//   panic -> "Panic(<code>)"
// Returns null when there is no decodable revert data (e.g. user-rejected actions).
function decodeContractError(error) {
  // ethers v6 may already have decoded a custom error from the contract interface.
  if (error && error.revert && error.revert.name) {
    const args = (error.revert.args ?? []).map((a) => (a != null && a.toString ? a.toString() : String(a)));
    return args.length ? `${error.revert.name}(${args.join(", ")})` : error.revert.name;
  }
  const data = findRevertData(error);
  if (!data || data.length < 10) return null;
  const selector = data.slice(0, 10).toLowerCase();
  if (selector === ERROR_STRING_SELECTOR) {
    try {
      const [reason] = ethers.AbiCoder.defaultAbiCoder().decode(["string"], "0x" + data.slice(10));
      return String(reason);
    } catch { return null; }
  }
  if (selector === PANIC_SELECTOR) {
    try {
      const [code] = ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], "0x" + data.slice(10));
      return `Panic(${code.toString()})`;
    } catch { return null; }
  }
  try {
    const parsed = ERROR_INTERFACE.parseError(data);
    if (!parsed) return null;
    const args = (parsed.args ?? []).map((a) => (a != null && a.toString ? a.toString() : String(a)));
    return args.length ? `${parsed.name}(${args.join(", ")})` : parsed.name;
  } catch { return null; }
}

function extractErrorMessage(error, fallback = t("errors.unknown")) {
  if (!error) {
    return fallback;
  }

  // Prefer a decoded contract revert (custom error name / require string) over the generic
  // provider message, which is otherwise just "execution reverted" or a raw 4-byte selector.
  const decoded = decodeContractError(error);
  if (decoded) return decoded;

  const candidates = [
    error.shortMessage,
    error.reason,
    error.message,
    error.info?.error?.message,
    error.info?.payload?.error?.message,
    error.error?.message,
    error.data?.message,
    error.cause?.message,
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    const trimmed = candidate.trim();
    if (!trimmed) continue;

    if (trimmed.includes("could not coalesce error")) {
      continue;
    }

    return trimmed;
  }

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return fallback;
}


function getWalletProvider() {
  return state.walletProvider || window.ethereum || null;
}

function setWalletButton() {
  const connected = Boolean(state.account);
  elements.walletConnectButton.classList.toggle("connected", connected);
  setIconButtonText(
    elements.walletConnectButton,
    connected ? shortAddress(state.account) : t("wallet.connect")
  );
}

function walletKey(wallet) {
  return wallet.info?.rdns || wallet.info?.uuid || wallet.info?.name || `wallet-${Math.random()}`;
}

function registerWallet(info, provider) {
  if (!provider) return;
  const key = info?.rdns || info?.uuid || info?.name || provider;
  const exists = state.discoveredWallets.some((item) => item.key === key);
  if (exists) return;
  state.discoveredWallets.push({
    key,
    info: {
      name: info?.name || (provider.isMetaMask ? "MetaMask" : t("wallet.injectedWallet")),
      rdns: info?.rdns || "",
    },
    provider,
  });
}

function setupWalletDiscovery() {
  window.addEventListener("eip6963:announceProvider", (event) => {
    registerWallet(event.detail?.info, event.detail?.provider);
    renderWalletList();
  });

  if (window.ethereum) {
    window.dispatchEvent(new Event("eip6963:requestProvider"));
  }
}

function openWalletModal() {
  renderWalletList();
  elements.walletModal.hidden = false;
}

function closeWalletModal() {
  elements.walletModal.hidden = true;
}

function renderWalletList() {
  if (state.discoveredWallets.length === 0) {
    elements.walletList.innerHTML = `
      <div class="status-box warning">${t("wallet.notDetected")}</div>
    `;
    return;
  }

  elements.walletList.innerHTML = state.discoveredWallets
    .map(
      (wallet) => `
        <button type="button" class="wallet-item" data-wallet-key="${escapeHtml(wallet.key)}">
          <span class="wallet-item-main">
            <span class="wallet-item-name">${escapeHtml(wallet.info.name || t("wallet.defaultName"))}</span>
            <span class="wallet-item-sub">${escapeHtml(wallet.info.rdns || t("wallet.injectedWallet"))}</span>
          </span>
          <span class="wallet-item-sub">${escapeHtml(t("wallet.connect"))}</span>
        </button>
      `
    )
    .join("");
}

function updateNetworkInfo() {
  const network = getSelectedNetwork();
  elements.networkRpc.textContent = network.rpcUrl;
  elements.networkChainId.textContent = `${network.chainId} (${network.chainIdHex})`;
  elements.networkIssuer.textContent = network.issuer;
  elements.networkExplorer.innerHTML = `<a href="${network.explorer}" target="_blank" rel="noreferrer">${network.explorer}</a>`;
}

function updateProofTypeHint() {
  const proofType = getSelectedProofType();
  elements.borrowerBtcRow.hidden = proofType !== "repayment";
  elements.timeoutRepayRow.hidden = proofType !== "timeout-repay";
  if (proofType === "pledge" || proofType === "unlock") {
    elements.btcTxidRow.hidden = false;
    setFooterNote(t("form.footerMinConfirmations"));
  } else if (proofType === "renewal") {
    elements.btcTxidRow.hidden = true;
    setFooterNote(t("form.footerRenewal"));
  } else if (proofType === "repayment") {
    elements.btcTxidRow.hidden = true;
    setFooterNote(t("form.footerRepayment"));
  } else if (proofType === "timeout-repay") {
    elements.btcTxidRow.hidden = true;
    setFooterNote(t("form.footerTimeoutRepay"));
  } else if (proofType === "execute-increase") {
    elements.btcTxidRow.hidden = true;
    setFooterNote(t("form.footerExecuteIncrease"));
  } else if (proofType === "cancel-increase") {
    elements.btcTxidRow.hidden = true;
    setFooterNote(t("form.footerCancelIncrease"));
  } else {
    elements.btcTxidRow.hidden = false;
    setFooterNote(t("form.footerRenewalTopup"));
  }
  updateSubmitButtonText();
}

async function connectWallet() {
  const providerObject = getWalletProvider();
  if (!providerObject) {
    throw new Error(t("errors.noWallet"));
  }

  state.provider = new ethers.BrowserProvider(providerObject);
  await state.provider.send("eth_requestAccounts", []);
  state.signer = await state.provider.getSigner();
  state.account = await state.signer.getAddress();
  state.chainIdHex = await providerObject.request({ method: "eth_chainId" });
  const matchedWallet = state.discoveredWallets.find((wallet) => wallet.provider === providerObject);
  state.walletLabel = matchedWallet?.info?.name || t("wallet.defaultName");
  setWalletStatus(
    t("wallet.connected", {
      wallet: escapeHtml(state.walletLabel),
      account: escapeHtml(state.account),
      chainId: escapeHtml(state.chainIdHex),
    }),
    "success"
  );
  setWalletButton();
}

async function ensureSelectedNetwork() {
  const network = getSelectedNetwork();
  const providerObject = getWalletProvider();

  if (!providerObject) {
    throw new Error(t("errors.noWallet"));
  }

  let currentChainId = await providerObject.request({ method: "eth_chainId" });
  if (currentChainId.toLowerCase() === network.chainIdHex.toLowerCase()) {
    state.chainIdHex = currentChainId;
    return;
  }

  try {
    await providerObject.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: network.chainIdHex }],
    });
  } catch (error) {
    if (error && error.code === 4902) {
      await providerObject.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: network.chainIdHex,
            chainName: network.chainName,
            rpcUrls: [network.rpcUrl],
            nativeCurrency: network.nativeCurrency,
            blockExplorerUrls: [network.explorer],
          },
        ],
      });
      await providerObject.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: network.chainIdHex }],
      });
    } else {
      throw error;
    }
  }

  state.chainIdHex = await providerObject.request({ method: "eth_chainId" });
}

function attachWalletListeners() {
  const providerObject = getWalletProvider();
  if (!providerObject || typeof providerObject.on !== "function") {
    return;
  }

  providerObject.on("accountsChanged", async (accounts) => {
    if (!accounts || accounts.length === 0) {
      state.provider = null;
      state.signer = null;
      state.account = null;
      state.chainIdHex = null;
      setWalletStatus(t("wallet.disconnected"), "warning");
      setWalletButton();
      return;
    }

    state.account = accounts[0];
    state.chainIdHex = await providerObject.request({ method: "eth_chainId" });
    setWalletStatus(
      t("wallet.connected", {
        wallet: escapeHtml(state.walletLabel || t("wallet.defaultName")),
        account: escapeHtml(state.account),
        chainId: escapeHtml(state.chainIdHex),
      }),
      "success"
    );
    setWalletButton();
  });

  providerObject.on("chainChanged", async (chainId) => {
    state.chainIdHex = chainId;
    if (state.account) {
      setWalletStatus(
        t("wallet.connected", {
          wallet: escapeHtml(state.walletLabel || t("wallet.defaultName")),
          account: escapeHtml(state.account),
          chainId: escapeHtml(chainId),
        }),
        "success"
      );
    }
  });
}

async function handleWalletSelect(walletKey) {
  try {
    setBusy(true);
    const selectedWallet = walletKey
      ? state.discoveredWallets.find((wallet) => wallet.key === walletKey)
      : null;
    if (selectedWallet) {
      state.walletProvider = selectedWallet.provider;
      state.walletLabel = selectedWallet.info?.name || t("wallet.defaultName");
    } else if (!state.walletProvider && window.ethereum) {
      state.walletProvider = window.ethereum;
      state.walletLabel = window.ethereum.isMetaMask
        ? "MetaMask"
        : window.ethereum.isCoinbaseWallet
          ? "Coinbase Wallet"
          : t("wallet.injectedWallet");
    }
    closeWalletModal();
    setStatus(t("wallet.connecting"), "warning");
    await connectWallet();
    attachWalletListeners();
    setStatus(t("wallet.connectedShort"), "success");
  } catch (error) {
    console.error(error);
    const message = extractErrorMessage(error, t("errors.unknown"));
    setStatus(t("wallet.connectFailed", { message: escapeHtml(message) }), "error");
  } finally {
    setBusy(false);
  }
}

async function handleConnectClick() {
  if (state.account) {
    openWalletModal();
    return;
  }

  if (state.discoveredWallets.length === 0 && window.ethereum) {
    state.walletProvider = window.ethereum;
    state.walletLabel = window.ethereum.isMetaMask
      ? "MetaMask"
      : window.ethereum.isCoinbaseWallet
        ? "Coinbase Wallet"
        : t("wallet.injectedWallet");
    await handleWalletSelect();
    return;
  }

  if (state.discoveredWallets.length <= 1) {
    const singleWallet = state.discoveredWallets[0];
    await handleWalletSelect(singleWallet?.key);
    return;
  }

  openWalletModal();
}


async function btcRpc(method, params) {
  const response = await fetch(BTC_APIS.rpc, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "1.0",
      id: Date.now(),
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(t("errors.btcRpcHttp", { status: response.status }));
  }

  const payload = await response.json();
  if (payload.error) {
    throw new Error(payload.error.message || t("errors.btcRpcError"));
  }

  return payload.result;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(t("errors.requestFailed", { url, status: response.status }));
  }
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(t("errors.requestFailed", { url, status: response.status }));
  }
  return response.text();
}

async function fetchBtcTransaction(txid) {
  try {
    const tx = await btcRpc("getrawtransaction", [txid, true]);
    return {
      txid: tx.txid,
      hex: tx.hex,
      blockHash: tx.blockhash,
      blockHeight: tx.blockheight,
      confirmations: tx.confirmations || 0,
    };
  } catch (primaryError) {
    const txInfo = await fetchJson(`${BTC_APIS.fallback}/tx/${txid}`);
    const txHex = await fetchText(`${BTC_APIS.fallback}/tx/${txid}/hex`);
    const blockHeight = txInfo.status?.block_height || null;
    let confirmations = 0;
    if (blockHeight) {
      const bestHeightText = await fetchText(`${BTC_APIS.fallback}/blocks/tip/height`);
      const bestHeight = Number(bestHeightText);
      confirmations = bestHeight - blockHeight + 1;
    }
    return {
      txid: txid,
      hex: txHex.trim(),
      blockHash: txInfo.status?.block_hash || null,
      blockHeight,
      confirmations,
      primaryError,
    };
  }
}

async function fetchBlockData(blockHash) {
  try {
    const firstPage = await fetchJson(`${BTC_APIS.explorer}/block/${blockHash}`);
    const txIds = Array.isArray(firstPage.txs) ? firstPage.txs.map((item) => item.txid) : [];

    for (let page = 2; page <= Number(firstPage.totalPages || 0); page += 1) {
      const pageData = await fetchJson(`${BTC_APIS.explorer}/block/${blockHash}?page=${page}`);
      if (Array.isArray(pageData.txs)) {
        txIds.push(...pageData.txs.map((item) => item.txid));
      }
    }

    return {
      height: Number(firstPage.height),
      txIds,
    };
  } catch (primaryError) {
    const blockInfo = await fetchJson(`${BTC_APIS.fallback}/block/${blockHash}`);
    const txIds = await fetchJson(`${BTC_APIS.fallback}/block/${blockHash}/txids`);
    return {
      height: Number(blockInfo.height),
      txIds,
      primaryError,
    };
  }
}

function normalizeTxid(txid) {
  return txid.trim().replace(/^0x/i, "").toLowerCase();
}


function validateInputs() {
  const orderAddress = elements.orderAddress.value.trim();
  const proofType = getSelectedProofType();

  if (!ethers.isAddress(orderAddress)) {
    throw new Error(t("errors.invalidOrderAddress"));
  }

  if (proofType === "renewal") {
    return {
      orderAddress,
      btcTxid: null,
      borrowerBtcAddress: null,
      timeoutRepayEnabled: null,
    };
  }

  if (proofType === "repayment") {
    const borrowerBtcAddress = elements.borrowerBtcAddress.value.trim();
    if (!borrowerBtcAddress) {
      throw new Error(t("errors.invalidBorrowerBtcAddress"));
    }
    return {
      orderAddress,
      btcTxid: null,
      borrowerBtcAddress,
      timeoutRepayEnabled: null,
    };
  }

  if (proofType === "timeout-repay") {
    return {
      orderAddress,
      btcTxid: null,
      borrowerBtcAddress: null,
      timeoutRepayEnabled: elements.timeoutRepayEnabled.value === "true",
    };
  }

  if (proofType === "execute-increase" || proofType === "cancel-increase") {
    return {
      orderAddress,
      btcTxid: null,
      borrowerBtcAddress: null,
      timeoutRepayEnabled: null,
    };
  }

  const btcTxid = normalizeTxid(elements.btcTxid.value);
  if (!/^[0-9a-f]{64}$/.test(btcTxid)) {
    throw new Error(t("errors.invalidBtcTxid"));
  }

  return {
    orderAddress,
    btcTxid,
    borrowerBtcAddress: null,
    timeoutRepayEnabled: null,
  };
}


function buildEmptyRenewalProof() {
  const rawData = "0x";
  const blockHeight = 0;
  const merkleProof = {
    proof: [],
    root: ethers.ZeroHash,
    leaf: ethers.ZeroHash,
    flags: [],
  };

  return {
    txRawData: rawData,
    blockHeight,
    confirmations: null,
    txIndex: null,
    merkleProof,
  };
}

function hexToBytes(hex) {
  const clean = hex.replace(/^0x/i, "").toLowerCase();
  if (clean.length % 2 !== 0) {
    throw new Error(t("errors.invalidHexLength", { hex }));
  }

  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = Number.parseInt(clean.slice(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function reverseHex(hex) {
  const bytes = hexToBytes(hex);
  return bytesToHex(bytes.reverse());
}

async function computeBitcoinParent(leftHex, rightHex) {
  const combinedHex = `${reverseHex(leftHex)}${reverseHex(rightHex)}`;
  const firstHash = ethers.sha256(`0x${combinedHex}`);
  const secondHash = ethers.sha256(firstHash);
  return reverseHex(secondHash);
}

async function generateMerkleProof(txIds, targetTxid) {
  const normalizedTxIds = txIds.map(normalizeTxid);
  const target = normalizeTxid(targetTxid);
  const txIndex = normalizedTxIds.indexOf(target);

  if (txIndex < 0) {
    throw new Error(t("errors.txNotInBlock"));
  }

  let level = normalizedTxIds.slice();
  let currentIndex = txIndex;
  const proof = [];
  const flags = [];

  while (level.length > 1) {
    const isRightNode = currentIndex % 2 === 1;
    let siblingIndex;

    if (isRightNode) {
      siblingIndex = currentIndex - 1;
    } else if (currentIndex === level.length - 1) {
      siblingIndex = currentIndex;
    } else {
      siblingIndex = currentIndex + 1;
    }

    proof.push(`0x${level[siblingIndex]}`);
    flags.push(!isRightNode);

    const nextLevel = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = i + 1 < level.length ? level[i + 1] : level[i];
      nextLevel.push(await computeBitcoinParent(left, right));
    }

    level = nextLevel;
    currentIndex = Math.floor(currentIndex / 2);
  }

  return {
    txIndex,
    proof,
    flags,
    root: `0x${level[0]}`,
    leaf: `0x${target}`,
  };
}

async function buildProof(txid) {
  setStatus(t("status.queryingBtc"), "warning");
  const tx = await fetchBtcTransaction(txid);

  if (!tx.hex) {
    throw new Error(t("errors.noRawTx"));
  }

  if (!tx.blockHash) {
    throw new Error(t("errors.txUnconfirmed"));
  }

  if ((tx.confirmations || 0) < MIN_CONFIRMATIONS) {
    throw new Error(
      t("errors.insufficientConfirmations", {
        current: tx.confirmations || 0,
        required: MIN_CONFIRMATIONS,
      })
    );
  }

  setStatus(t("status.generatingProof"), "warning");
  const blockData = await fetchBlockData(tx.blockHash);
  const resolvedBlockHeight = Number(tx.blockHeight || blockData.height || 0);
  if (!resolvedBlockHeight) {
    throw new Error(t("errors.noBlockHeight"));
  }
  const merkle = await generateMerkleProof(blockData.txIds, tx.txid);

  return {
    txRawData: `0x${tx.hex}`,
    blockHeight: resolvedBlockHeight,
    confirmations: Number(tx.confirmations || 0),
    txIndex: merkle.txIndex,
    merkleProof: {
      proof: merkle.proof,
      root: merkle.root,
      leaf: merkle.leaf,
      flags: merkle.flags,
    },
  };
}


async function submitProof(event) {
  event.preventDefault();
  setBusy(true);

  try {
    const proofType = getSelectedProofType();
    const { orderAddress, btcTxid, borrowerBtcAddress, timeoutRepayEnabled } = validateInputs();
    const network = getSelectedNetwork();

    if (!state.signer) {
      await connectWallet();
    }

    setStatus(t("status.switchingNetwork"), "warning");
    await ensureSelectedNetwork();

    const providerObject = getWalletProvider();
    state.provider = new ethers.BrowserProvider(providerObject);
    state.signer = await state.provider.getSigner();
    state.account = await state.signer.getAddress();
    state.chainIdHex = await providerObject.request({ method: "eth_chainId" });
    setWalletStatus(
      t("wallet.connected", {
        wallet: escapeHtml(state.walletLabel || t("wallet.defaultName")),
        account: escapeHtml(state.account),
        chainId: escapeHtml(state.chainIdHex),
      }),
      "success"
    );
    setWalletButton();

    if (proofType === "repayment") {
      setStatus(t("status.submittingRepayment"), "warning");
      const orderContract = new ethers.Contract(orderAddress, ORDER_ABI, state.signer);
      const txResponse = await orderContract.confirmRepaymentFromBalance(borrowerBtcAddress);

      setResult(`
        <div class="result-list">
          <div class="result-item">
            <div class="key">${t("result.borrowerBtc")}</div>
            <div class="mono">${escapeHtml(borrowerBtcAddress)}</div>
          </div>
        </div>
      `);

      setStatus(
        t("status.txSubmitted", { hash: escapeHtml(txResponse.hash) }),
        "warning"
      );

      const receipt = await txResponse.wait();
      if (!receipt || Number(receipt.status) !== 1) {
        throw new Error(t("errors.txFailed"));
      }

      setStatus(
        t("status.txSuccess", { hash: escapeHtml(txResponse.hash) }),
        "success"
      );

      setResult(`
        <div class="result-list">
          <div class="result-item">
            <div class="key">${t("result.status")}</div>
            <div>${t("result.submitted")}</div>
          </div>
          <div class="result-item">
            <div class="key">${t("result.type")}</div>
            <div>${getResultProofTypeLabel(proofType)}</div>
          </div>
          <div class="result-item">
            <div class="key">${t("result.borrowerBtc")}</div>
            <div class="mono">${escapeHtml(borrowerBtcAddress)}</div>
          </div>
          <div class="result-item">
            <div class="key">${t("result.evmTx")}</div>
            <div class="mono">${escapeHtml(txResponse.hash)}</div>
          </div>
          <div class="result-item">
            <div class="key">${t("result.order")}</div>
            <div class="mono">${escapeHtml(shortAddress(orderAddress))}</div>
          </div>
        </div>
      `);
      return;
    }

    if (proofType === "timeout-repay") {
      setStatus(t("status.submittingTimeoutRepay"), "warning");
      const orderContract = new ethers.Contract(orderAddress, ORDER_ABI, state.signer);
      const txResponse = await orderContract.setTimeoutRepayEnabled(timeoutRepayEnabled);

      setStatus(
        t("status.txSubmitted", { hash: escapeHtml(txResponse.hash) }),
        "warning"
      );

      const receipt = await txResponse.wait();
      if (!receipt || Number(receipt.status) !== 1) {
        throw new Error(t("errors.txFailed"));
      }

      setStatus(
        t("status.txSuccess", { hash: escapeHtml(txResponse.hash) }),
        "success"
      );

      setResult(`
        <div class="result-list">
          <div class="result-item">
            <div class="key">${t("result.status")}</div>
            <div>${t("result.submitted")}</div>
          </div>
          <div class="result-item">
            <div class="key">${t("result.type")}</div>
            <div>${getResultProofTypeLabel(proofType)}</div>
          </div>
          <div class="result-item">
            <div class="key">${t("result.timeoutRepayEnabled")}</div>
            <div>${getTimeoutRepayEnabledLabel(timeoutRepayEnabled)}</div>
          </div>
          <div class="result-item">
            <div class="key">${t("result.evmTx")}</div>
            <div class="mono">${escapeHtml(txResponse.hash)}</div>
          </div>
          <div class="result-item">
            <div class="key">${t("result.order")}</div>
            <div class="mono">${escapeHtml(shortAddress(orderAddress))}</div>
          </div>
        </div>
      `);
      return;
    }

    if (proofType === "execute-increase") {
      setStatus(t("status.submittingExecuteIncrease"), "warning");
      const orderContract = new ethers.Contract(orderAddress, ORDER_ABI, state.signer);
      const txResponse = await orderContract.executeIncreaseRequest();

      setStatus(
        t("status.txSubmitted", { hash: escapeHtml(txResponse.hash) }),
        "warning"
      );

      const receipt = await txResponse.wait();
      if (!receipt || Number(receipt.status) !== 1) {
        throw new Error(t("errors.txFailed"));
      }

      setStatus(
        t("status.txSuccess", { hash: escapeHtml(txResponse.hash) }),
        "success"
      );

      setResult(`
        <div class="result-list">
          <div class="result-item">
            <div class="key">${t("result.status")}</div>
            <div>${t("result.submitted")}</div>
          </div>
          <div class="result-item">
            <div class="key">${t("result.type")}</div>
            <div>${getResultProofTypeLabel(proofType)}</div>
          </div>
          <div class="result-item">
            <div class="key">${t("result.evmTx")}</div>
            <div class="mono">${escapeHtml(txResponse.hash)}</div>
          </div>
          <div class="result-item">
            <div class="key">${t("result.order")}</div>
            <div class="mono">${escapeHtml(shortAddress(orderAddress))}</div>
          </div>
        </div>
      `);
      return;
    }

    if (proofType === "cancel-increase") {
      setStatus(t("status.submittingCancelIncrease"), "warning");
      const issuerContract = new ethers.Contract(network.issuer, ISSUER_ABI, state.signer);
      const txResponse = await issuerContract.cancelObsidianIncrease(orderAddress);

      setStatus(
        t("status.txSubmitted", { hash: escapeHtml(txResponse.hash) }),
        "warning"
      );

      const receipt = await txResponse.wait();
      if (!receipt || Number(receipt.status) !== 1) {
        throw new Error(t("errors.txFailed"));
      }

      setStatus(
        t("status.txSuccess", { hash: escapeHtml(txResponse.hash) }),
        "success"
      );

      setResult(`
        <div class="result-list">
          <div class="result-item">
            <div class="key">${t("result.status")}</div>
            <div>${t("result.submitted")}</div>
          </div>
          <div class="result-item">
            <div class="key">${t("result.type")}</div>
            <div>${getResultProofTypeLabel(proofType)}</div>
          </div>
          <div class="result-item">
            <div class="key">${t("result.evmTx")}</div>
            <div class="mono">${escapeHtml(txResponse.hash)}</div>
          </div>
          <div class="result-item">
            <div class="key">${t("result.order")}</div>
            <div class="mono">${escapeHtml(shortAddress(orderAddress))}</div>
          </div>
        </div>
      `);
      return;
    }

    let proof;
    if (proofType === "renewal") {
      setStatus(t("status.renewalDirect"), "warning");
      proof = buildEmptyRenewalProof();
    } else {
      proof = await buildProof(btcTxid);
    }

    setResult(
      btcTxid
        ? `
      <div class="result-list">
        <div class="result-item">
          <div class="key">${t("result.btcTx")}</div>
          <div class="mono">${escapeHtml(btcTxid)}</div>
        </div>
        <div class="result-item">
          <div class="key">${t("result.blockHeight")}</div>
          <div>${escapeHtml(proof.blockHeight)}</div>
        </div>
        <div class="result-item">
          <div class="key">${t("result.confirmations")}</div>
          <div>${escapeHtml(proof.confirmations)}</div>
        </div>
        <div class="result-item">
          <div class="key">${t("result.proof")}</div>
          <div>${escapeHtml(t("result.proofNodes", { count: proof.merkleProof.proof.length }))}</div>
        </div>
      </div>
    `
        : `
      <div class="result-list">
        <div class="result-item">
          <div class="key">${t("result.btcTx")}</div>
          <div>${t("result.notProvided")}</div>
        </div>
        <div class="result-item">
          <div class="key">${t("result.proof")}</div>
          <div>${t("result.emptyProof")}</div>
        </div>
      </div>
    `
    );

    let txResponse;
    if (proofType === "pledge") {
      setStatus(t("status.submittingPledge"), "warning");
      const orderContract = new ethers.Contract(orderAddress, ORDER_ABI, state.signer);
      txResponse = await orderContract.submitToLenderTransferProof(
        proof.txRawData,
        proof.blockHeight,
        proof.merkleProof,
        0
      );
    } else if (proofType === "unlock") {
      setStatus(t("status.submittingUnlock"), "warning");
      const issuerContract = new ethers.Contract(network.issuer, ISSUER_ABI, state.signer);
      txResponse = await issuerContract.submitRegularUnlockTransferProof(
        orderAddress,
        proof.txRawData,
        proof.blockHeight,
        proof.merkleProof
      );
    } else {
      setStatus(
        proofType === "renewal" ? t("status.submittingRenewal") : t("status.submittingRenewalTopup"),
        "warning"
      );
      const orderContract = new ethers.Contract(orderAddress, ORDER_ABI, state.signer);
      txResponse = await orderContract.submitRenewalOrderProof(
        proof.txRawData,
        proof.blockHeight,
        proof.merkleProof
      );
    }

    setStatus(
      t("status.txSubmitted", { hash: escapeHtml(txResponse.hash) }),
      "warning"
    );

    const receipt = await txResponse.wait();
    if (!receipt || Number(receipt.status) !== 1) {
      throw new Error(t("errors.txFailed"));
    }

    setStatus(
      t("status.txSuccess", { hash: escapeHtml(txResponse.hash) }),
      "success"
    );

    setResult(`
      <div class="result-list">
        <div class="result-item">
          <div class="key">${t("result.status")}</div>
          <div>${t("result.submitted")}</div>
        </div>
        <div class="result-item">
          <div class="key">${t("result.type")}</div>
          <div>${getResultProofTypeLabel(proofType)}</div>
        </div>
        <div class="result-item">
          <div class="key">${t("result.evmTx")}</div>
          <div class="mono">${escapeHtml(txResponse.hash)}</div>
        </div>
        <div class="result-item">
          <div class="key">${t("result.order")}</div>
          <div class="mono">${escapeHtml(shortAddress(orderAddress))}</div>
        </div>
        <div class="result-item">
          <div class="key">${t("result.btcHeight")}</div>
          <div>${escapeHtml(proof.blockHeight)}</div>
        </div>
      </div>
    `);
  } catch (error) {
    console.error(error);
    const message = extractErrorMessage(error);
    setStatus(t("status.submitFailed", { message: escapeHtml(message) }), "error");
  } finally {
    setBusy(false);
  }
}


export function init() {
  renderStaticTexts();
  updateNetworkInfo();
  updateProofTypeHint();
  setupWalletDiscovery();
  setWalletButton();
  setWalletStatus(t("wallet.notConnected"), "warning");
  setStatus(t("status.waitingInput"));
  setResult(t("status.noResult"));

  elements.network.addEventListener("change", () => {
    updateNetworkInfo();
    setStatus(t("status.networkSwitched"));
  });

  elements.proofType.addEventListener("change", updateProofTypeHint);
  elements.languageToggleButton.addEventListener("click", () => {
    setLocale(state.locale === "zh" ? "en" : "zh");
  });
  elements.walletConnectButton.addEventListener("click", handleConnectClick);
  elements.walletModalClose.addEventListener("click", closeWalletModal);
  elements.walletList.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-wallet-key]");
    if (!button) return;
    await handleWalletSelect(button.dataset.walletKey);
  });
  elements.walletModal.addEventListener("click", (event) => {
    if (event.target === elements.walletModal) {
      closeWalletModal();
    }
  });
  elements.form.addEventListener("submit", submitProof);
}
