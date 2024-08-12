import { createElement, Fragment, ReactNode } from 'react'

type Tree =
  | { name?: string; children: Tree[] }
  | { name: 'text'; value: string }

// parse HTML by creating a template element and walking its tree
// keep only elements and their contents (i.e. no attributes)
const simpleParse = (clue: string): Tree => {
  const template = document.createElement('template')
  template.innerHTML = clue

  const tree: Tree = { children: [] }
  const stack: [Tree, Node][] = [[tree, template.content]]

  while (stack.length) {
    const [parent, node] = stack.pop()!

    // we never push text nodes onto the stack, so this should not happen
    if (!('children' in parent)) throw new Error('tree invariant broken')
    if (!node.hasChildNodes()) continue

    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i]
      if (child.nodeType === Node.TEXT_NODE) {
        parent.children.push({
          name: 'text',
          value: child.nodeValue!,
        })
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const { tagName } = child as Element
        const treeChild: Tree = {
          name: tagName.toLowerCase(),
          children: [],
        }
        parent.children.push(treeChild)
        stack.push([treeChild, child])
      }
    }
  }

  template.remove()

  return tree
}

// render allowed elements into React elements
const simpleRender = (tree: Tree, allowed: string[]): ReactNode => {
  if (tree.name === 'text') return 'value' in tree ? tree.value : ''

  // if the name is not 'text' then it is guaranteed that `children` exists
  if (!('children' in tree)) throw new Error('unreachable')

  const children = tree.children.map((child) => simpleRender(child, allowed))
  if (tree.name !== undefined && allowed.includes(tree.name)) {
    return createElement(tree.name, {}, ...children)
  } else {
    return createElement(Fragment, {}, ...children)
  }
}

export default ({ text = '' }): JSX.Element => {
  // case where we should italicize the whole clue
  if (text.startsWith('""') && text.endsWith('""')) {
    return createElement('i', {}, text.slice(1, -1))
  }

  // fast path for text with no HTML and no entities
  if (!text.match(/[<>]|&[^;]+;/)) return createElement('span', {}, text)

  // otherwise, parse HTML and render allowed elements
  const allowed = ['em', 'strong', 'u', 'i', 'b', 'sup', 'sub']
  const tree = simpleParse(text)
  return createElement('span', {}, simpleRender(tree, allowed))
}
