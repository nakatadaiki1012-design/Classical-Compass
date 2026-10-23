// アドレス管理は、戻るボタンの仕組み（backStack）より先に読み込む（最初の履歴に印を付けるため）
import './utils/urlState';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
