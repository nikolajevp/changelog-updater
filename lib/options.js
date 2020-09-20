module.exports = { getOptions };

function getOptions(args = []) {
	const defaults = {
		/**
		 * If true: creates a new changelog instead of updating,
		 * or fails if a changelog already exists.
		 */
		init: false,
		/**
		 * If true: throws error when changelog has no changes,
		 * otherwise exits program without updating changelog.
		 */
		check: false,
	};

	return { ...defaults, ...parseArgs(args) };
}

function parseArgs(args) {
	return args.reduce((newArgs, current, i, args) => {
		if (!current.startsWith('--')) {
			return newArgs;
		}

		current = current.slice(2);

		if (current.length === 0) {
			return newArgs;
		}

		const next = args[i + 1];

		if (current.includes('=')) {
			const [left, right] = current.split('=');
			newArgs[left] = right;
		} else if (next && !next.startsWith('--')) {
			newArgs[current] = next;
		} else {
			newArgs[current] = true;
		}

		return newArgs;
	}, {});
}
