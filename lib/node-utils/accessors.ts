import {
	AST_NODE_TYPES,
	ASTUtils,
	type TSESTree,
} from '@typescript-eslint/utils';

import { isLiteral, isTemplateLiteral } from './is-node-of-type';

/**
 * A `Literal` with a `value` of type `string`.
 */
interface StringLiteral<Value extends string = string>
	extends TSESTree.StringLiteral {
	value: Value;
}

/**
 * Checks if the given `node` is a `StringLiteral`.
 *
 * If a `value` is provided & the `node` is a `StringLiteral`,
 * the `value` will be compared to that of the `StringLiteral`.
 */
const isStringLiteral = <V extends string>(
	node: TSESTree.Node,
	value?: V
): node is StringLiteral<V> =>
	isLiteral(node) &&
	typeof node.value === 'string' &&
	(value === undefined || node.value === value);

interface TemplateLiteral<Value extends string = string>
	extends TSESTree.TemplateLiteral {
	quasis: [TSESTree.TemplateElement & { value: { raw: Value; cooked: Value } }];
}

/**
 * Checks if the given `node` is a `TemplateLiteral`.
 *
 * Complex `TemplateLiteral`s are not considered specific, and so will return `false`.
 *
 * If a `value` is provided & the `node` is a `TemplateLiteral`,
 * the `value` will be compared to that of the `TemplateLiteral`.
 */
const isSimpleTemplateLiteral = <V extends string>(
	node: TSESTree.Node,
	value?: V
): node is TemplateLiteral<V> =>
	isTemplateLiteral(node) &&
	node.quasis.length === 1 && // bail out if not simple
	(value === undefined || node.quasis[0].value.raw === value);

export type StringNode<S extends string = string> =
	| StringLiteral<S>
	| TemplateLiteral<S>;

/**
 * Checks if the given `node` is a {@link StringNode}.
 */
export const isStringNode = <V extends string>(
	node: TSESTree.Node,
	specifics?: V
): node is StringNode<V> =>
	isStringLiteral(node, specifics) || isSimpleTemplateLiteral(node, specifics);

/**
 * Gets the value of the given `StringNode`.
 *
 * If the `node` is a `TemplateLiteral`, the `raw` value is used;
 * otherwise, `value` is returned instead.
 */
export const getStringValue = <S extends string>(node: StringNode<S>): S =>
	isSimpleTemplateLiteral(node) ? node.quasis[0].value.raw : node.value;

/**
 * An `Identifier` with a known `name` value
 */
interface KnownIdentifier<Name extends string> extends TSESTree.Identifier {
	name: Name;
}

/**
 * Checks if the given `node` is an `Identifier`.
 *
 * If a `name` is provided, & the `node` is an `Identifier`,
 * the `name` will be compared to that of the `identifier`.
 */
export const isIdentifier = <V extends string>(
	node: TSESTree.Node,
	name?: V
): node is KnownIdentifier<V> =>
	ASTUtils.isIdentifier(node) && (name === undefined || node.name === name);

/**
 * Checks if the given `node` is a "supported accessor".
 *
 * This means that it's a node can be used to access properties,
 * and who's "value" can be statically determined.
 *
 * `MemberExpression` nodes most commonly contain accessors,
 * but it's possible for other nodes to contain them.
 *
 * If a `value` is provided & the `node` is an `AccessorNode`,
 * the `value` will be compared to that of the `AccessorNode`.
 *
 * Note that `value` here refers to the normalised value.
 * The property that holds the value is not always called `name`.
 */
export const isSupportedAccessor = <V extends string>(
	node: TSESTree.Node,
	value?: V
): node is AccessorNode<V> =>
	isIdentifier(node, value) || isStringNode(node, value);

/**
 * Gets the value of the given `AccessorNode`,
 * account for the different node types.
 */
export const getAccessorValue = <S extends string = string>(
	accessor: AccessorNode<S>
): S =>
	accessor.type === AST_NODE_TYPES.Identifier
		? accessor.name
		: getStringValue(accessor);

export type AccessorNode<Specifics extends string = string> =
	| StringNode<Specifics>
	| KnownIdentifier<Specifics>;
