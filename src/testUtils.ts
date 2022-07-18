import { ElementType, ReactElement } from "react";
import {
  act,
  create,
  ReactTestInstance,
  ReactTestRenderer,
  ReactTestRendererJSON,
  ReactTestRendererNode,
} from "react-test-renderer";
import { expect } from "vitest";

export const waitFor = (
  callback: Function,
  { interval = 50, timeout = 1000 } = {}
): Promise<undefined> =>
  act(
    () =>
      new Promise((resolve, reject) => {
        const startTime = Date.now();

        const nextInterval = () => {
          setTimeout(() => {
            try {
              callback();
              resolve();
            } catch (err) {
              if (Date.now() - startTime > timeout) {
                reject(new Error("Timed out."));
              } else {
                nextInterval();
              }
            }
          }, interval);
        };

        nextInterval();
      })
  );

const serializer = {
  test(value: ReactWrapper): boolean {
    return value instanceof ReactWrapper;
  },
  serialize(val: ReactWrapper, config: any): string {
    const json = val.toJSON();
    const plugin = config.plugins.find(
      (p: any) => p != serializer && p.test(json)
    );
    return plugin.serialize(json, ...[...arguments].slice(1));
  },
};

expect.addSnapshotSerializer(serializer);

function getComponentNameFromType(type: ElementType): string {
  if (typeof type === "function") {
    return (type as any).displayName || type.name || 'null';
  }

  if (typeof type === "string") {
    return type;
  }
  return 'null';
}

function toJSON(
  inst: ReactTestInstance | string
): ReactTestRendererNode | null {
  if (typeof inst === "string") {
    return inst;
  }

  const { children, ...props } = inst.props;
  let renderedChildren = null;
  if (inst.children && inst.children.length) {
    for (let i = 0; i < inst.children.length; i++) {
      const renderedChild = toJSON(inst.children[i]);
      if (renderedChild !== null) {
        if (renderedChildren === null) {
          renderedChildren = [renderedChild];
        } else {
          renderedChildren.push(renderedChild);
        }
      }
    }
  }
  const json: ReactTestRendererJSON = {
    type: getComponentNameFromType(inst.type),
    props: props,
    children: renderedChildren,
  };
  Object.defineProperty(json, "$$typeof", {
    value: Symbol.for("react.test.json"),
  });
  return json;
}

class ReactWrapper {
  private rootRenderer: ReactTestRenderer;
  private instances?: ReactTestInstance[];

  constructor(
    rootRenderer: ReactTestRenderer,
    instances?: ReactTestInstance[]
  ) {
    this.rootRenderer = rootRenderer;
    this.instances = instances;
  }

  toJSON() {
    return this.instances?.length
      ? toJSON(this.instances[0])
      : this.rootRenderer.toJSON();
  }

  find<T>(selector: React.ElementType<T>) {
    return new ReactWrapper(
      this.rootRenderer,
      this.rootRenderer.root.findAllByType(selector)
    );
  }

  exists() {
    return (this.instances?.length ?? 0) > 0;
  }
}

export function mount(element: ReactElement) {
  return new ReactWrapper(create(element));
}
