/**
 * AsyncQueue — a simple push/pull channel for bridging push-based callbacks
 * into pull-based AsyncGenerators.
 *
 * Usage:
 *   const q = new AsyncQueue<string>()
 *   callback = (v) => q.push(v)
 *   await longRunningFn({ onChunk: q.push.bind(q) })
 *   q.done()
 *   for await (const v of q) { yield v }
 */
export class AsyncQueue<T> {
	private queue: T[] = []
	private resolvers: Array<(value: IteratorResult<T>) => void> = []
	private closed = false

	/** Push a value — immediately resolves any waiting consumer. */
	push(value: T): void {
		if (this.resolvers.length > 0) {
			// Consumer is waiting — hand value directly
			const resolve = this.resolvers.shift()!

			resolve({
				value,
				done: false
			})
		} else {
			this.queue.push(value)
		}
	}

	/** Signal that no more values will be pushed. */
	done(): void {
		this.closed = true

		// Drain any pending consumers
		for (const resolve of this.resolvers) {
			resolve({
				value: undefined as unknown as T,
				done: true
			})
		}

		this.resolvers = []
	}

	/** Iterate values as they arrive; resolves when done() is called. */
	[Symbol.asyncIterator](): AsyncIterator<T> {
		return {
			next: (): Promise<IteratorResult<T>> => {
				if (this.queue.length > 0) {
					return Promise.resolve({
						value: this.queue.shift()!,
						done: false
					})
				}

				if (this.closed) {
					return Promise.resolve({
						value: undefined as unknown as T,
						done: true
					})
				}

				// No value yet — park until push() or done()
				return new Promise<IteratorResult<T>>((resolve) => {
					this.resolvers.push(resolve)
				})
			}
		}
	}
}
