import React from 'react';

/**
 * 画面の中で予期しないエラーが起きたとき、真っ白にならずに「読み込み直す」案内を出す。
 */
interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('画面の表示でエラー:', error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl border border-[#383127] bg-[#1b1611] p-6 text-center space-y-4">
          <p className="text-lg font-classical-display font-bold text-[#f5ebd9]">表示に失敗しました</p>
          <p className="text-sm text-[#bdb1a1] leading-relaxed">
            申し訳ありません。この画面を表示する途中で問題が起きました。読み込み直すと直ることが多いです。
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => this.setState({ error: null })}
              className="px-4 py-2 rounded-lg border border-[#2e2924] bg-[#1e1a16] text-[#f5ebd9] text-sm font-bold hover:bg-[#2b241c]"
            >
              もう一度表示
            </button>
            <button
              onClick={() => {
                try {
                  window.location.hash = '';
                } catch {
                  /* 消せなくても読み込み直す */
                }
                window.location.reload();
              }}
              className="px-4 py-2 rounded-lg bg-[#c99738] text-[#161412] text-sm font-bold hover:bg-[#d9a848]"
            >
              最初から読み込み直す
            </button>
          </div>
          <p className="text-[11px] text-[#7d7266] font-mono break-all">{String(this.state.error.message || this.state.error)}</p>
        </div>
      </div>
    );
  }
}
