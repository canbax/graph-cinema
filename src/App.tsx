import { useState } from 'react'
import Whiteboard from './components/Whiteboard'
import ArticleReader from './components/ArticleReader'
import TextImporter from './components/TextImporter'
import './App.css'

function App() {
  const [hasProcessed, setHasProcessed] = useState(false);

  return (
    <>
      <Whiteboard />
      {!hasProcessed ? (
        <TextImporter onProcess={() => setHasProcessed(true)} />
      ) : (
        <ArticleReader />
      )}
    </>
  )
}

export default App
