import React from "react";
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilValue,
  useSetRecoilState,
  useRecoilValueLoadable,
} from "recoil";
import ReactDOM from "react-dom";
import { ErrorBoundary } from "react-error-boundary";

const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const ItemId = atom({
  key: "ItemId",
  default: 1,
  effects_UNSTABLE: [
    ({ onSet }) => {
      onSet((id) => {
        console.log("(1) set", id);
      });
    },
  ],
});

const Item = selector({
  key: "Item",
  cachePolicy_UNSTABLE: { eviction: "most-recent" },
  get: async ({ get }) => {
    const id = get(ItemId);
    console.log("(2) get", id);
    return wait(250).then(() => {
      if (id === 3) throw new Error();
      return { id };
    });
  },
});

const ShowItem = () => {
  const item = useRecoilValue(Item);
  return (
    <div>
      <div>Current ID: {item.id}</div>
    </div>
  );
};

const ShowItemWithErrorBoundary = () => {
  return (
    <ErrorBoundary FallbackComponent={Recover}>
      <React.Suspense fallback="loading...">
        <ShowItem />
      </React.Suspense>
    </ErrorBoundary>
  );
};

const NextId = () => {
  const setId = useSetRecoilState(ItemId);
  return (
    <div>
      <button onClick={() => setId((c) => c + 1)}>Next Id</button>
    </div>
  );
};

const Recover = ({ resetErrorBoundary }) => {
  console.log("recover view");
  const setId = useSetRecoilState(ItemId);
  const onClick = () => {
    console.log("recover clicked");
    setId(1);
    resetErrorBoundary();
  };
  return <button onClick={onClick}>Recover</button>;
};

const ItemLoadable = () => {
  const item2 = useRecoilValueLoadable(Item);
  console.log("(itemLoadable)", item2.state, item2.contents);
  return null;
};

ReactDOM.render(
  <RecoilRoot>
    <ShowItemWithErrorBoundary />
    <NextId />
    {/* <ItemLoadable /> */}
  </RecoilRoot>,
  document.getElementById("root")
);
