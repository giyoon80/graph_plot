"use strict";

window.infoTranslations = {
  en: {
    title: "Graph Value Extraction Guide", brand: "Graph Value Extractor", back: "Back to tool", heading: "Graph Value Extraction Guide",
    lead: "Follow these steps to turn a graph screenshot into CSV data using the controls and fields on the page. All coordinate calculations happen in your browser.",
    step1Heading: "1. Choose an image", step1Body1: "In the left panel, select Choose image and pick a graph screenshot. Use an image where the axes, ticks, and value labels are all visible. Values cannot be calculated accurately when an axis is cropped or its tick values are missing.", step1Body2: "When the image appears in the workspace on the right, X-axis left mode is selected automatically. You can now mark the axes on the image.",
    step2Heading: "2. Mark four axis reference points", step2Body: "Select X-axis left, X-axis right, Y-axis bottom, and Y-axis top in order, then click the corresponding tick line on each axis. For example, mark the X-axis tick at 0 on the left and the tick at 10 on the right.",
    step3Heading: "3. Enter axis values and scale", step3Body: "Select Number or Date for each axis, then enter the same values shown on the original graph for X left, X right, Y bottom, and Y top. For a date axis, enter the actual dates at both ends. Use Linear for evenly spaced ticks, or Log for values growing by multiples such as 1, 10, and 100; log values must all be greater than zero.",
    step4Heading: "4. Select a series and mark data points", step4Body: "Set a series name in Results. For multiple lines, select Add to create a series, then choose the series you are working on. Select Data points and click a point or line on the graph to add its X/Y value to the table. All series share the same X- and Y-axis calibration, so extract a dual-Y-axis graph in separate projects for each axis scale.",
    step5Heading: "5. Verify points and save results", step5Body: "Compare the first, middle, and last table values with the original graph. Hover over the image to show the magnifier. Move a selected point by 1px with arrow keys, or 10px with Shift+arrow. Remove an incorrect point with Undo last or Delete.",
    exampleHeading: "Example: Extracting a date-based growth graph", exampleBody1: "For a monthly or daily growth graph, select Date as the X-axis type. For example, if the left tick is 2024-01-01 and the right tick is 2024-12-31, enter them as the X left and X right values. Keep the Y axis as Number and enter its bottom and top tick values.", exampleBody2: "For a growth graph whose values increase by multiples such as 1, 10, 100, and 1,000, set that axis scale to Log. Mark about three points first and compare them with the original ticks before extracting the rest.",
    faqHeading: "Frequently asked questions", faq1Question: "What happens to existing data points when I change a reference point?", faq1Answer: "Their image positions stay the same, and their X/Y results are recalculated with the new reference points and axis values. Check the table again after changing calibration.", faq2Question: "Do I need to mark all four axis reference points?", faq2Answer: "Yes. Both X-axis points and both Y-axis points must be set before X/Y values can be calculated.", faq3Question: "What does a saved project contain?", faq3Answer: "The project JSON contains the selected image, axis types, scales and values, reference points, series, and data points. Load the same file to continue where you stopped.",
    notice: "To continue later, set a project name and use Save project to download a JSON file. Loading that file restores the image, axis settings, series, and data points. Export final results with Download CSV or Copy.", about: "About", privacy: "Privacy policy", terms: "Terms of use", contact: "Contact and report an issue"
  },
  ja: {
    title: "グラフ値抽出ガイド", brand: "グラフ値抽出ツール", back: "ツールに戻る", heading: "グラフ値抽出ガイド",
    lead: "画面上のボタンと入力欄を次の順で使うと、グラフのスクリーンショットをCSVデータに整理できます。座標計算はすべてブラウザ内で行われます。",
    step1Heading: "1. 画像を選択する", step1Body1: "左側の「画像を選択」からグラフのスクリーンショットを選びます。軸、目盛り、値の表記がすべて見える画像を使用してください。軸が切れていたり目盛り値が見えない場合は、正確な値を計算できません。", step1Body2: "画像が右の作業エリアに表示されると、X軸の左モードが自動的に選択されます。続けて画像上の軸を指定します。",
    step2Heading: "2. 軸の基準点を4つ指定する", step2Body: "X軸の左、X軸の右、Y軸の下、Y軸の上を順に選び、各軸の対応する目盛り線をクリックします。たとえば、左のX軸の0の目盛りと右の10の目盛りを指定します。",
    step3Heading: "3. 軸の値とスケールを入力する", step3Body: "各軸の種類で数値または日付を選び、X軸左・X軸右・Y軸下・Y軸上に元のグラフと同じ値を入力します。日付軸では両端の実際の日付を入力します。目盛りが等間隔なら線形、1・10・100のように倍率で増えるなら対数を選びます。対数の値はすべて0より大きい必要があります。",
    step4Heading: "4. 系列を選びデータポイントを指定する", step4Body: "結果で系列名を設定します。複数の線がある場合は「追加」で系列を作成し、作業する系列を選びます。「データポイント」を選択してグラフ上の点または線をクリックすると、表にX/Y値が追加されます。すべての系列は同じX軸・Y軸の基準を共有するため、左右でスケールが異なるY軸のグラフは軸ごとに別のプロジェクトで抽出してください。",
    step5Heading: "5. 点を確認して結果を保存する", step5Body: "表の最初・中央・最後の値を元のグラフと比較します。画像上にマウスを置くと拡大鏡が表示されます。選択した点は矢印キーで1px、Shift+矢印キーで10px移動できます。間違った点は「最後を元に戻す」またはDeleteで削除します。",
    exampleHeading: "例: 日付別の成長グラフを抽出する", exampleBody1: "月別または日別の成長グラフでは、X軸の種類に日付を選びます。たとえば左の目盛りが2024-01-01、右の目盛りが2024-12-31なら、それぞれX軸左とX軸右の値に入力します。Y軸は数値のままにして、下と上の目盛り値を入力します。", exampleBody2: "1、10、100、1,000のように値が倍率で増える成長グラフでは、その軸のスケールを対数に設定します。まず3点程度を指定して元の目盛りと一致するか確認してから、残りの点を抽出してください。",
    faqHeading: "よくある質問", faq1Question: "基準点を変更すると、すでに指定したデータポイントはどうなりますか？", faq1Answer: "データポイントの画像上の位置は維持され、新しい基準点と軸の値でX/Yの結果が再計算されます。調整を変更した後は表の値をもう一度確認してください。", faq2Question: "軸の基準点は4つすべて指定する必要がありますか？", faq2Answer: "はい。X軸の2点とY軸の2点がすべて設定されてから、X/Y値を計算できます。", faq3Question: "保存したプロジェクトには何が含まれますか？", faq3Answer: "プロジェクトJSONには選択した画像、軸の種類・スケール・値、基準点、系列、データポイントが含まれます。同じファイルを読み込むと中断した作業を続けられます。",
    notice: "あとで作業を続ける場合は、プロジェクト名を設定して「プロジェクトを保存」を使いJSONファイルを保存します。そのファイルを読み込むと、画像、軸設定、系列、データポイントが復元されます。最終結果はCSVダウンロードまたはコピーで出力します。", about: "サービスについて", privacy: "プライバシーポリシー", terms: "利用規約", contact: "お問い合わせ・不具合報告"
  },
  "zh-CN": {
    title: "图表数值提取指南", brand: "图表数值提取器", back: "返回工具", heading: "图表数值提取指南",
    lead: "按以下顺序使用页面中的按钮和输入框，即可将图表截图整理为 CSV 数据。所有坐标计算都在浏览器中完成。",
    step1Heading: "1. 选择图像", step1Body1: "在左侧面板点击“选择图像”，然后选择图表截图。请使用坐标轴、刻度和数值标签均清晰可见的图像。坐标轴被裁切或看不到刻度数值时，无法准确计算数值。", step1Body2: "图像显示在右侧工作区后，系统会自动选中 X 轴左侧模式。接下来可在图像上标记坐标轴。",
    step2Heading: "2. 标记四个坐标轴参考点", step2Body: "依次选择 X 轴左侧、X 轴右侧、Y 轴底部和 Y 轴顶部，然后点击每个坐标轴对应的刻度线。例如，可标记左侧 X 轴数值为 0 的刻度和右侧数值为 10 的刻度。",
    step3Heading: "3. 输入坐标轴数值和刻度", step3Body: "为每个坐标轴选择数值或日期类型，然后在 X 轴左侧、X 轴右侧、Y 轴底部和 Y 轴顶部输入与原始图表相同的数值。日期轴应输入两端的实际日期。刻度均匀递增时选线性；数值按 1、10、100 这类倍数增长时选对数，且所有对数值必须大于零。",
    step4Heading: "4. 选择数据系列并标记数据点", step4Body: "在结果区域设置数据系列名称。若有多条线，请点击“添加”创建数据系列，然后选择正在处理的系列。选择“数据点”后，点击图表上的点或线，即可将其 X/Y 数值添加到表格。所有数据系列共用同一套 X 轴和 Y 轴校准，因此对于左右 Y 轴刻度不同的图表，请按每个轴刻度分别使用项目提取。",
    step5Heading: "5. 验证点位并保存结果", step5Body: "将表格中的起点、中间点和终点数值与原始图表比较。将鼠标悬停在图像上可显示放大镜。使用方向键可将选中点移动 1px，按 Shift+方向键可移动 10px。使用“撤销上一步”或 Delete 删除错误点。",
    exampleHeading: "示例：提取按日期统计的增长图", exampleBody1: "对于按月或按日的增长图，请将 X 轴类型设为日期。例如，左侧刻度为 2024-01-01、右侧刻度为 2024-12-31 时，分别输入到 X 轴左侧和 X 轴右侧数值。Y 轴保持数值类型，并输入底部和顶部刻度数值。", exampleBody2: "对于数值按 1、10、100、1,000 这类倍数增长的图表，请将该轴刻度设为对数。先标记约三个点并与原始刻度核对，再提取其余点。",
    faqHeading: "常见问题", faq1Question: "更改参考点后，已标记的数据点会怎样？", faq1Answer: "数据点在图像中的位置会保持不变，并会根据新的参考点和坐标轴数值重新计算 X/Y 结果。修改校准后请再次检查表格。", faq2Question: "必须标记所有四个坐标轴参考点吗？", faq2Answer: "是的。必须设置两个 X 轴点和两个 Y 轴点，才能计算 X/Y 数值。", faq3Question: "保存的项目包含什么？", faq3Answer: "项目 JSON 包含所选图像、坐标轴类型、刻度和数值、参考点、数据系列以及数据点。加载同一文件即可继续之前的工作。",
    notice: "如需稍后继续，请设置项目名称并使用“保存项目”下载 JSON 文件。加载该文件会恢复图像、坐标轴设置、数据系列和数据点。使用下载 CSV 或复制导出最终结果。", about: "关于服务", privacy: "隐私政策", terms: "使用条款", contact: "联系与问题反馈"
  }
};
