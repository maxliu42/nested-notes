# Nested Notes

"Nested Notes" is a hierarchical, block-based text editor that allows users to write notes in a linear fashion, while also providing the ability to nest notes within each other infinitely. This structure is designed to visually and functionally represent the recursive nature of brainstorming and detailed note-taking.

## Core Concepts

-   **Canvas:** The main, top-level document area.
-   **Text Block:** A standard block for text content.
-   **Note Block:** A special block that acts as a container for other blocks, creating a nested, indented canvas.

## Features & Key Interactions

This editor is designed to be keyboard-centered for a fluid and efficient workflow.

-   **Create a Nested Note (`Tab`):** On a new, empty line, pressing `Tab` converts the Text Block into a new, empty Note Block and places the cursor inside it.
-   **Exit a Note Block (`Shift+Tab`):** When the cursor is on the first line inside a Note Block, pressing `Shift+Tab` "outdents" the block, converting it back into a standard Text Block.
-   **Create Newline outside Note (`Shift+Up` / `Shift+Down`):**
    -   When on the first line of a Note Block, pressing `Shift+Up` adds a new Text Block directly _before_ the current Note Block.
    -   When on the last line of a Note Block, pressing `Shift+Down` adds a new Text Block directly _after_ the current Note Block.
    -   This functionality is also available via the **"Shift Up"** and **"Shift Down"** buttons in the toolbar.
-   **Continue After a Note (`Enter`):** When a Note Block itself is selected (not the text inside it), pressing `Enter` creates a new, empty Text Block immediately below it at the same indentation level.

## Getting Started

To run this project locally, follow these steps:

1.  **Install Dependencies:**
    Open your terminal in the `frontend` directory and run:

    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    After the installation is complete, run the following command:

    ```bash
    npm run dev
    ```

3.  **Open in Browser:**
    The application will be available at the local address provided in your terminal (usually `http://localhost:5173`).

---

This project is built using React and the [Lexical](https://lexical.dev/) text editor framework.
