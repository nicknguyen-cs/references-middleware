
# Parent UID

This is a Node.js application that retrieves the parent references of a given entry in Contentstack.

## Prerequisites

Before running this application, make sure you have the following:

- Node.js installed on your machine
- Contentstack API key and management token
- Environment variables set for `API_KEY` and `MANAGEMENT_TOKEN`

## Example Response

       [
          {
            entry_uid: 'blt159480226214a1da',
            content_type_uid: 'blog_post',
            locale: 'en-us',
            title: 'Robotics – Changing Our Lives and Future',
            content_type_title: 'Blog Entry',
            height: 0
          },
          {
            entry_uid: 'blt52194619332a8d47',
            content_type_uid: 'example',
            locale: 'en-us',
            title: 'Example Parent Reference',
            content_type_title: 'Example',
            height: 0
          },
          {
            entry_uid: 'blt169297312d1379a1',
            content_type_uid: 'blog_post',
            locale: 'en-us',
            title: 'Data Mining and its significance in Business Analytics',
            content_type_title: 'Blog Entry',
            height: 1
          }
     ]

## Installation

1. Clone the repository:
2. Install the dependencies:

    ```bash
    cd parent-uid
    npm install
    ```

3. Start the application:

    ```bash
    npm start
    ```

## Usage

Once the **application** is running, you can make a GET request to `/references` with the following query parameters:

- `entry_uid`: The UID of the entry
- `content_type_uid`: The UID of the content type

The application will retrieve the parent references of the specified entry and return them as a JSON response.

## API Reference

### GET /references

Retrieves the parent references of a given entry in Contentstack.

- Query Parameters:
  - `entry_uid` (required): The UID of the entry.
  - `content_type_uid` (required): The UID of the content type.

- Response:
  - Status: 200 OK
  - Body: An array of parent references.