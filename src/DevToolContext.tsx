import React, { useState, useEffect } from "react";
import * as devtoolsProtocol from "devtools-protocol";
async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

interface DevToolContextType {
  injectedStyles: chrome.scripting.CSSInjection[];
  injectCSS: (chosenClass: string) => void;
  resetCSS: () => void;
  queryElement: (chosenSelector: string) => void;
  attachDebugger: () => void;
}

const defaultDevContext: DevToolContextType = {
  injectedStyles: [],
  injectCSS: (chosenSelector: string) => {},
  resetCSS: () => {},
  queryElement: (chosenSelector: string) => {},
  attachDebugger: () => {},
};

export const DevToolContext = React.createContext(defaultDevContext);

interface DevToolProps {
  children: JSX.Element;
}

export function DevToolProvider(props: DevToolProps) {
  const [injectedStyles, setInjectedStyles] = useState<
    chrome.scripting.CSSInjection[]
  >([]);

  //when component mounts, attach debugger to current tab

  useEffect(() => {
    async function debugAttach() {
      const tab = await getCurrentTab();
      //attach debugger if valid tab
      if (tab.id || tab.id === 0) {
        const debugee = {
          tabId: tab.id,
        };
        chrome.debugger.attach(debugee, "1.3");
        console.log("Attached!");
        chrome.debugger.onEvent.addListener((source, method, params) => {
          //alert(source);
          //alert(method);
          //alert(params);
          console.log("Received message!");
          //console.log(source);
          console.log(params);
        });
      } else alert("Invalid tab ID!");
    }
    debugAttach();
    //chrome.debugger.attach
  }, []);

  async function attachDebugger() {
    const tab = await getCurrentTab();
    if (tab || tab === 0) {
      const debugee = {
        tabId: tab.id,
      };
      chrome.debugger.attach(debugee, "1.3");
      console.log("Attached!");
      chrome.debugger.onEvent.addListener((source, method, params) => {
        alert(source);
        alert(method);
        alert(params);
      });
      chrome.debugger.sendCommand(debugee, "DOM.enable");
      chrome.debugger.sendCommand(debugee, "CSS.enable");
    } else alert("Invalid tab ID!");
  }

  async function queryElement(chosenSelector: string) {
    //attempt 2 with document
    const tab = await getCurrentTab();

    if (!tab && tab !== 0) return;
    const debugee = {
      tabId: tab.id,
    };
    // chrome.debugger.sendCommand(debugee, "DOM.enable");
    // chrome.debugger.sendCommand(debugee, "CSS.enable");
    chrome.debugger.sendCommand(debugee, "DOM.enable");
    chrome.debugger.sendCommand(debugee, "CSS.enable");

    chrome.debugger.sendCommand(
      debugee,
      "DOM.getDocument",
      {
        depth: 1,
      },
      (res: any) => {
        console.log(res);
        const root: devtoolsProtocol.Protocol.DOM.Node = res.root;
        const nodeId = root.nodeId;
        chrome.debugger.sendCommand(
          debugee,
          "DOM.querySelector",
          {
            nodeId: nodeId,
            selector: chosenSelector,
          },
          (res: any) => {
            console.log(res);
            const nodeId: devtoolsProtocol.Protocol.DOM.NodeId = res.nodeId;

            console.log("Res ID is: " + nodeId);
            chrome.debugger.sendCommand(
              debugee,
              "CSS.getMatchedStylesForNode",
              {
                nodeId: nodeId,
              },
              (res: any) => {
                const inline: devtoolsProtocol.Protocol.CSS.CSSStyle =
                  res.inlineStyle;
                const attributes: devtoolsProtocol.Protocol.CSS.CSSStyle =
                  res.attributesStyle;
                const matched: devtoolsProtocol.Protocol.CSS.RuleMatch[] =
                  res.matchedCSSRules;
                const inherited: devtoolsProtocol.Protocol.CSS.CSSKeyframesRule[] =
                  res.inherited;
                console.log(inline);
                console.log(attributes);
                console.log(matched);
                console.log(inherited);
              }
            );
          }
        );
      }
    );
  }

  // async function highlightElement(chosenSelector: string) {
  //   const tab = await getCurrentTab();
  //   if (!tab.id && tab.id !== 0) return;
  //   const debugee = {
  //     tabId: tab.id,
  //   };
  //   chrome.debugger.sendCommand(debugee, "DOM.enable");
  //   chrome.debugger.sendCommand(debugee, "CSS.enable");

  //   chrome.debugger.sendCommand(
  //     debugee,
  //     "DOM.getDocument",
  //     {
  //       depth: 1,
  //     },
  //     (res: any) => {
  //       console.log(res);
  //       const root = res.root;
  //       const nodeId = root.nodeId;
  //       console.log("DOM Node is: " + nodeId);
  //       chrome.debugger.sendCommand(
  //         debugee,
  //         "DOM.querySelectorAll",
  //         {
  //           nodeId: nodeId,
  //           selector: chosenSelector,
  //         },
  //         (res) => {
  //           console.log(res);
  //           const nodeMatches = res.nodeIds;
  //         }
  //       );
  //     }
  //   );

  //   let classes = [];
  // }

  //function to injectCSS
  async function injectCSS(chosenClass: string) {
    //const head = window.document.getElementsByTagName("HEAD")[0];
    //const newStyle = document.createElement("style");
    const tab = await getCurrentTab();
    const newCSS = `
    @keyframes spinny {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    ${chosenClass} {
      animation: spinny infinite 20s linear;
    }
    `;

    if (tab.id || tab.id === 0) {
      try {
        const newInjection: chrome.scripting.CSSInjection = {
          target: { tabId: tab.id },
          css: newCSS,
        };
        chrome.scripting.insertCSS(newInjection, () => {
          setInjectedStyles((prevStyles) => [...prevStyles, newInjection]);
          alert("Sucessfully inserted CSS!");
        });
      } catch (error) {
        alert(error);
      }
    } else alert("Invalid Tab ID!");
  }

  async function resetCSS() {
    //const head = window.document.getElementsByTagName("HEAD")[0];
    const tab = await getCurrentTab();
    const tabId = tab.id;
    if (tabId !== undefined) {
      const results = Promise.all(
        injectedStyles.map((styleInjection) => {
          (chrome.scripting as any).removeCSS(styleInjection);
        })
      );
      setInjectedStyles([]);
    }
  }

  return (
    <DevToolContext.Provider
      value={{
        injectedStyles,
        injectCSS,
        resetCSS,
        queryElement,
        attachDebugger,
      }}
    >
      {props.children}
    </DevToolContext.Provider>
  );
}
